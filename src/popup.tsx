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

  useEffect(() => {
    loadData();
  }, []);

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

  const performSearch = (query: string) => {
    const searchUrl = getSearchUrl(query);
    chrome.tabs.create({ url: searchUrl });
  };

  const performAllSearches = () => {
    if (savedSearches.length === 0) return;
    
    if (savedSearches.length > 5) {
      if (!confirm(`Open ${savedSearches.length} search tabs?`)) return;
    }
    
    savedSearches.forEach(search => {
      const searchUrl = getSearchUrl(search.query);
      chrome.tabs.create({ url: searchUrl });
    });
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
      <div className="popup-header">
        <h1>Unwavering Focus</h1>
        <div className="tab-count">
          Tabs: {tabCount}/{maxTabs}
        </div>
      </div>

      <div className="popup-content">
        <div className="section">
          <h2>Saved Searches ({savedSearches.length})</h2>
          {savedSearches.length === 0 ? (
            <p className="empty-state">
              No saved searches yet. Use Alt+Shift+S to save a search query.
            </p>
          ) : (
            <div className="search-list">
              {savedSearches.map(search => (
                <div key={search.id} className="search-item">
                  <div className="search-info">
                    <div className="search-query">{search.query}</div>
                    <div className="search-date">{formatDate(search.timestamp)}</div>
                  </div>
                  <div className="search-actions">
                    <button
                      className="search-btn"
                      onClick={() => performSearch(search.query)}
                      title="Perform this search"
                    >
                      Search
                    </button>
                    <button
                      className="delete-btn"
                      onClick={() => deleteSearch(search.id)}
                      title="Delete this search"
                    >
                      ×
                    </button>
                  </div>
                </div>
              ))}
              {savedSearches.length > 1 && (
                <button className="search-all-btn" onClick={performAllSearches}>
                  Search All ({savedSearches.length})
                </button>
              )}
            </div>
          )}
        </div>

        <div className="section">
          <h2>Quick Actions</h2>
          <div className="action-buttons">
            <button className="action-btn focus-btn" onClick={openFocusPage}>
              Focus Page
            </button>
            <button className="action-btn options-btn" onClick={openOptions}>
              Options
            </button>
          </div>
        </div>

        <div className="section">
          <h2>Status</h2>
          <div className="status-grid">
            <div className="status-item">
              <span className="status-label">Distraction Blocker:</span>
              <span className={`status-value ${config?.distractionBlocker?.enabled ? 'enabled' : 'disabled'}`}>
                {config?.distractionBlocker?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Eye Care:</span>
              <span className={`status-value ${config?.eyeCare?.enabled ? 'enabled' : 'disabled'}`}>
                {config?.eyeCare?.enabled ? 'Enabled' : 'Disabled'}
              </span>
            </div>
            <div className="status-item">
              <span className="status-label">Tab Limiter:</span>
              <span className={`status-value ${maxTabs > 0 ? 'enabled' : 'disabled'}`}>
                {maxTabs > 0 ? 'Enabled' : 'Disabled'}
              </span>
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