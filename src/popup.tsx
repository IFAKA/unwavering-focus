import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { SavedSearch, ExtensionConfig } from './types';
import { getSearchUrl } from './utils/urlUtils';
import './popup.scss';

// Define default config locally
const defaultConfig: ExtensionConfig = {
  smartSearch: { enabled: true },
  distractionBlocker: { enabled: true, domains: [] },
  eyeCare: { enabled: true, soundVolume: 0.5 },
  tabLimiter: { maxTabs: 3, excludedDomains: [] },
  focusPage: {
    motivationalMessage: "Enfócate. Tu tiempo es oro.",
    habits: [],
    reinforcementMessages: {
      high: "Your discipline forges your excellence.",
      medium: "Stay consistent. Progress builds momentum.",
      low: "Regain control. Small actions today build momentum."
    }
  }
};

interface PopupProps {}

const Popup: React.FC<PopupProps> = () => {
  const [savedSearches, setSavedSearches] = useState<SavedSearch[]>([]);
  const [config, setConfig] = useState<ExtensionConfig | null>(null);
  const [tabCount, setTabCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [countdown, setCountdown] = useState<string>('');
  const [nextEyeCareAlarm, setNextEyeCareAlarm] = useState<number | undefined>();

  useEffect(() => {
    loadData();
  }, []);

  // Countdown timer for eye care
  useEffect(() => {
    if (config?.eyeCare?.enabled && nextEyeCareAlarm) {
      const updateCountdown = () => {
        const now = Date.now();
        const timeUntilAlarm = nextEyeCareAlarm - now;
        
        if (timeUntilAlarm <= 0) {
          // Alarm is due, check if we're in the 20-second period
          const timeSinceAlarm = Math.abs(timeUntilAlarm);
          if (timeSinceAlarm <= 20000) { // 20 seconds
            // Show 20-second countdown
            const remainingSeconds = Math.max(0, Math.ceil((20000 - timeSinceAlarm) / 1000));
            setCountdown(`20s: ${remainingSeconds}s`);
          } else {
            // Show next 20-minute countdown
            const nextAlarm = nextEyeCareAlarm + (20 * 60 * 1000);
            const timeUntilNext = nextAlarm - now;
            const minutes = Math.floor(timeUntilNext / 60000);
            const seconds = Math.floor((timeUntilNext % 60000) / 1000);
            setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          }
        } else {
          // Show normal countdown
          const minutes = Math.floor(timeUntilAlarm / 60000);
          const seconds = Math.floor((timeUntilAlarm % 60000) / 1000);
          setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [config?.eyeCare?.enabled, nextEyeCareAlarm]);

  const loadData = async () => {
    try {
      console.log('Loading popup data...');
      const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
      console.log('Received popup data:', response);
      
      // Set default values regardless of response
      setSavedSearches([]);
      setConfig(defaultConfig);
      setTabCount(0);
      
      // If we got a valid response, use it
      if (response && typeof response === 'object') {
        setSavedSearches(response.savedSearches || []);
        setConfig(response.config || defaultConfig);
        setTabCount(response.tabCount || 0);
        setNextEyeCareAlarm(response.nextEyeCareAlarm);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default values if loading fails
      setSavedSearches([]);
      setConfig(defaultConfig);
      setTabCount(0);
    } finally {
      setLoading(false);
    }
  };

  const refreshData = () => {
    setLoading(true);
    loadData();
  };

  const deleteSearch = async (id: string) => {
    try {
      await chrome.runtime.sendMessage({ type: 'DELETE_SEARCH', id });
      refreshData(); // Refresh data after deletion
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  const performSearch = async (query: string, searchId?: string) => {
    const searchUrl = getSearchUrl(query);
    chrome.tabs.create({ url: searchUrl });
    
    // If a searchId is provided, delete the search from the list
    if (searchId) {
      try {
        await chrome.runtime.sendMessage({ type: 'DELETE_SEARCH', id: searchId });
        // Update the local state immediately
        setSavedSearches(prev => prev.filter(search => search.id !== searchId));
      } catch (error) {
        console.error('Error deleting search after performing:', error);
      }
    }
  };

  const performAllSearches = async () => {
    if (savedSearches.length === 0) return;
    
    if (savedSearches.length > 5) {
      if (!confirm(`Open ${savedSearches.length} search tabs?`)) return;
    }
    
    // Perform all searches
    savedSearches.forEach(search => {
      const searchUrl = getSearchUrl(search.query);
      chrome.tabs.create({ url: searchUrl });
    });
    
    // Delete all searches from the list
    try {
      await chrome.runtime.sendMessage({ type: 'CLEAR_ALL_SEARCHES' });
      setSavedSearches([]);
    } catch (error) {
      console.error('Error clearing all searches:', error);
    }
  };

  const openFocusPage = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('focus-page.html') });
  };

  const openOptions = () => {
    chrome.runtime.openOptionsPage();
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="popup">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const maxTabs = config?.tabLimiter?.maxTabs || 10;

  return (
    <div className="popup">
      <div className="popup-content">
        {/* Eye Care Countdown + Tab Counter - Compact */}
        {config?.eyeCare.enabled && (
          <div className="compact-section">
            <div className="status-row">
              <div className="status-item">
                <span className="icon">👁️</span>
                <span className="countdown">{countdown}</span>
              </div>
              <div className="status-item">
                <span className="icon">📑</span>
                <span className="tab-counter">{tabCount}/{maxTabs}</span>
              </div>
            </div>
          </div>
        )}

        {/* Saved Searches - Compact */}
        <div className="compact-section">
          <div className="section-header">
            <span className="icon">🔍</span>
            <span className="count">{savedSearches.length}</span>
          </div>
          {savedSearches.length === 0 ? (
            <div className="empty-hint">Alt+Shift+S to save</div>
          ) : (
            <div className="search-list-compact">
              {savedSearches.slice(0, 3).map(search => (
                <div key={search.id} className="search-item-compact">
                  <div className="search-query-compact" title={search.query}>
                    {search.query.length > 25 ? search.query.substring(0, 25) + '...' : search.query}
                  </div>
                  <div className="search-actions-compact">
                    <button
                      className="search-btn-compact"
                      onClick={() => performSearch(search.query, search.id)}
                      title="Search"
                    >
                      →
                    </button>
                    <button 
                      className="delete-btn-compact"
                      onClick={() => deleteSearch(search.id)}
                      title="Delete"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              {savedSearches.length > 3 && (
                <div className="more-indicator">+{savedSearches.length - 3} more</div>
              )}
              {savedSearches.length > 1 && (
                <button className="search-all-btn-compact" onClick={performAllSearches}>
                  Search All
                </button>
              )}
            </div>
          )}
        </div>

        {/* Quick Actions - Compact */}
        <div className="compact-section">
          <div className="quick-actions">
            <button className="action-btn primary" onClick={openFocusPage}>
              Focus
            </button>
            <button className="action-btn secondary" onClick={openOptions}>
              Settings
            </button>
          </div>
        </div>

        {/* Status - Compact */}
        <div className="compact-section">
          <div className="status-grid">
            <div className={`status-item ${config?.distractionBlocker.enabled ? 'enabled' : 'disabled'}`}>
              <span className="status-icon">🚫</span>
              <span className="status-text">Block</span>
            </div>
            <div className={`status-item ${config?.eyeCare.enabled ? 'enabled' : 'disabled'}`}>
              <span className="status-icon">👁️</span>
              <span className="status-text">Eye</span>
            </div>
            <div className={`status-item ${config?.tabLimiter.maxTabs ? 'enabled' : 'disabled'}`}>
              <span className="status-icon">📑</span>
              <span className="status-text">Tabs</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Render the popup
const root = document.getElementById('root');
if (root) {
  ReactDOM.render(<Popup />, root);
} 