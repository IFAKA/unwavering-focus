import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import './popup.scss';

interface StorageData {
  savedSearches: SearchQuery[];
  distractingDomains: DistractingDomain[];
  habitEntries: HabitEntry[];
  config: ExtensionConfig;
  tabCount: number;
  nextEyeCareAlarm?: number;
}

interface SearchQuery {
  id: string;
  query: string;
  timestamp: number;
}

interface DistractingDomain {
  domain: string;
  dailyLimit: number;
  currentCount: number;
  lastResetDate: string;
}

interface HabitEntry {
  habitId: string;
  date: string;
  status: 'excellent' | 'good' | 'not_done';
}

interface ExtensionConfig {
  smartSearch: { enabled: boolean; searchAllEnabled: boolean };
  distractionBlocker: { enabled: boolean; domains: DistractingDomain[] };
  eyeCare: { enabled: boolean; soundVolume: number };
  tabLimiter: { maxTabs: number; excludedDomains: string[] };
  focusPage: {
    motivationalMessage: string;
    habits: string[];
    reinforcementMessages: { high: string; medium: string; low: string };
  };
}

const Popup: React.FC = () => {
  const [data, setData] = useState<StorageData | null>(null);
  const [countdown, setCountdown] = useState<string>('--:--');

  // Countdown timer for eye care
  useEffect(() => {
    if (data?.config?.eyeCare?.enabled && data?.nextEyeCareAlarm) {
      const updateCountdown = () => {
        const now = Date.now();
        const timeUntilAlarm = data.nextEyeCareAlarm! - now;
        
        if (timeUntilAlarm <= 0) {
          // Alarm is due, check if we're in the 20-second period
          const timeSinceAlarm = Math.abs(timeUntilAlarm);
          if (timeSinceAlarm <= 20000) { // 20 seconds
            // Show only the remaining seconds
            const remainingSeconds = Math.max(0, Math.ceil((20000 - timeSinceAlarm) / 1000));
            setCountdown(`${remainingSeconds}s`);
          } else {
            // Show next 20-minute countdown
            const nextAlarm = data.nextEyeCareAlarm! + (20 * 60 * 1000);
            const timeUntilNext = nextAlarm - now;
            const minutes = Math.max(0, Math.floor(timeUntilNext / 60000));
            const seconds = Math.max(0, Math.floor((timeUntilNext % 60000) / 1000));
            setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          }
        } else {
          // Show normal countdown
          const minutes = Math.max(0, Math.floor(timeUntilAlarm / 60000));
          const seconds = Math.max(0, Math.floor((timeUntilAlarm % 60000) / 1000));
          setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
        }
      };

      updateCountdown();
      const interval = setInterval(updateCountdown, 1000);
      return () => clearInterval(interval);
    }
  }, [data?.config?.eyeCare?.enabled, data?.nextEyeCareAlarm]);

  const loadData = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
      setData(response);
    } catch (error) {
      console.error('Error loading data:', error);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const performSearch = async (query: SearchQuery) => {
    try {
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query.query)}`;
      await chrome.tabs.create({ url: searchUrl });
      // Remove the search item after performing the search
      await chrome.runtime.sendMessage({ type: 'DELETE_SEARCH', id: query.id });
      loadData(); // Refresh the list
    } catch (error) {
      console.error('Error performing search:', error);
    }
  };

  const performAllSearches = async () => {
    try {
      // Check if Search All is enabled in settings
      if (!data?.config?.smartSearch?.searchAllEnabled) {
        console.log('Search All is disabled in settings');
        return;
      }

      for (const query of data?.savedSearches || []) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query.query)}`;
        await chrome.tabs.create({ url: searchUrl });
      }
      // Remove all search items after performing all searches
      await chrome.runtime.sendMessage({ type: 'CLEAR_ALL_SEARCHES' });
      loadData();
    } catch (error) {
      console.error('Error performing all searches:', error);
    }
  };

  const deleteSearch = async (id: string) => {
    try {
      await chrome.runtime.sendMessage({ type: 'DELETE_SEARCH', id });
      loadData();
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  };

  if (!data) {
    return <div className="popup-loading">Loading...</div>;
  }

  const { savedSearches, config, tabCount } = data;
  const hasSearches = savedSearches.length > 0;

  return (
    <div className="popup-container">
      {/* Apple Watch Style Header - Essential Metrics */}
      <div className="watch-header">
        <div className="metric-group">
          <div className="metric-item" title='Eye Care'>
            <div className="metric-icon">👁</div>
            <div className="metric-value">{countdown}</div>
          </div>
          <div className="metric-item" title='Tab Limiter'>
            <div className="metric-icon">📑</div>
            <div className="metric-value">{tabCount}/{config?.tabLimiter?.maxTabs || 3}</div>
          </div>
        </div>
      </div>

      {/* Smart Search List - Compact, Scrollable */}
      {hasSearches ? (
        <div className="search-list">
          <div className="list-header">
            <span className="list-title">Saved Searches</span>
            <span className="list-count">{savedSearches.length}</span>
          </div>
          <div className="list-content">
            {savedSearches.slice(0, 3).map((query) => (
              <div key={query.id} className="search-item">
                <div className="search-text" title={query.query}>
                  {query.query.length > 25 ? query.query.substring(0, 25) + '...' : query.query}
                </div>
                <div className="search-actions">
                  <button 
                    className="search-btn"
                    onClick={() => performSearch(query)}
                    title="Search this query"
                  >
                    🔍
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteSearch(query.id)}
                    title="Delete this query"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {savedSearches.length > 3 && (
              <div className="more-indicator">
                +{savedSearches.length - 3} more
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">🔍</div>
          <div className="empty-title">No Saved Searches</div>
          <div className="empty-message">Use Alt+Shift+S to save search queries for later</div>
        </div>
      )}

      {/* Quick Actions - Minimal, Essential */}
      <div className="quick-actions">
        {hasSearches && config?.smartSearch?.searchAllEnabled && (
          <button 
            className="action-btn primary"
            onClick={performAllSearches}
            title="Search all saved queries"
          >
            🔍 Search All ({savedSearches.length})
          </button>
        )}
        
        <div className="action-row">
          <button 
            className="action-btn secondary"
            onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('focus-page.html') })}
            title="Go to Focus Page"
          >
            🎯 Focus
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => chrome.runtime.openOptionsPage()}
            title="Open Settings"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>

      {/* Status Indicators - Minimal */}
      <div className="status-indicators">
        <div className={`status-dot ${config?.distractionBlocker?.enabled ? 'active' : 'inactive'}`} title="Distraction Blocker">
          🚫
        </div>
        <div className={`status-dot ${config?.eyeCare?.enabled ? 'active' : 'inactive'}`} title="Eye Care">
          👁
        </div>
        <div className={`status-dot ${config?.tabLimiter?.maxTabs > 0 ? 'active' : 'inactive'}`} title="Tab Limiter">
          📑
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