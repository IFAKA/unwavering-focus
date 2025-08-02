import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
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

import { ExtensionConfig, DEFAULT_CONFIG } from './types';

const Popup: React.FC = () => {
  const [data, setData] = useState<StorageData | null>(null);
  const [countdown, setCountdown] = useState<string>('--:--');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'completed'>('idle');
  const [searchingQuery, setSearchingQuery] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [copiedItem, setCopiedItem] = useState<string>('');

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
      setSearchStatus('searching');
      setSearchingQuery(query.query);
      
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query.query)}`;
      await chrome.tabs.create({ url: searchUrl });
      
      // Remove the search item after performing the search
      await chrome.runtime.sendMessage({ type: 'DELETE_SEARCH', id: query.id });
      
      setSearchStatus('completed');
      setTimeout(() => {
        setSearchStatus('idle');
        setSearchingQuery('');
      }, 1500);
      
      loadData(); // Refresh the list
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchStatus('idle');
      setSearchingQuery('');
    }
  };

  const performAllSearches = async () => {
    try {
      // Check if Search All is enabled in settings
      if (!data?.config?.smartSearch?.searchAllEnabled) {
        console.log('Search All is disabled in settings');
        return;
      }

      setSearchStatus('searching');
      setSearchingQuery('All items');

      for (const query of data?.savedSearches || []) {
        const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query.query)}`;
        await chrome.tabs.create({ url: searchUrl });
      }
      
      // Remove all search items after performing all searches
      await chrome.runtime.sendMessage({ type: 'CLEAR_ALL_SEARCHES' });
      
      setSearchStatus('completed');
      setTimeout(() => {
        setSearchStatus('idle');
        setSearchingQuery('');
      }, 1500);
      
      loadData();
    } catch (error) {
      console.error('Error performing all searches:', error);
      setSearchStatus('idle');
      setSearchingQuery('');
    }
  };

  const deleteSearch = async (id: string) => {
    try {
      await chrome.runtime.sendMessage({ type: 'DELETE_SEARCH', id });
      loadData();
    } catch (error) {
      console.error('Error deleting item:', error);
    }
  };

  const copySearchQuery = async (query: string) => {
    try {
      await navigator.clipboard.writeText(query);
      // Show copy feedback
      setCopyStatus('copied');
      setCopiedItem(query);
      setTimeout(() => {
        setCopyStatus('idle');
        setCopiedItem('');
      }, 1500);
      console.log('Item copied to clipboard:', query);
    } catch (error) {
      console.error('Error copying item:', error);
    }
  };

  if (!data) {
    return <LoadingSpinner size="medium" message="Loading extension..." />;
  }

  const { savedSearches, config, tabCount } = data;
  const hasSearches = savedSearches.length > 0;

  return (
    <div className="popup-container">
      {/* Copy Status Feedback */}
      {copyStatus === 'copied' && (
        <div className="copy-status">
          <div className="copy-content">
            <div className="copy-icon">📋</div>
            <div className="copy-text">Copied!</div>
            {copiedItem && (
              <div className="copy-item">
                "{copiedItem.length > 20 ? copiedItem.substring(0, 20) + '...' : copiedItem}"
              </div>
            )}
          </div>
        </div>
      )}

      {/* Search Status Feedback */}
      {searchStatus !== 'idle' && (
        <div className={`search-status ${searchStatus}`}>
          <div className="status-content">
            <div className="status-icon">
              {searchStatus === 'searching' ? '🔍' : '✓'}
            </div>
            <div className="status-text">
              {searchStatus === 'searching' ? 'Searching...' : 'Completed'}
            </div>
            {searchingQuery && (
              <div className="status-query">
                "{searchingQuery.length > 20 ? searchingQuery.substring(0, 20) + '...' : searchingQuery}"
              </div>
            )}
          </div>
        </div>
      )}

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
            <span className="list-title">Saved Items</span>
            <span className="list-count">{savedSearches.length}</span>
          </div>
          <div className="list-content">
            {savedSearches.map((query) => (
              <div key={query.id} className="search-item">
                <div className="search-text" title={query.query}>
                  {query.query.length > 25 ? query.query.substring(0, 25) + '...' : query.query}
                </div>
                <div className="search-actions">
                  <button 
                    className="search-btn"
                    onClick={() => performSearch(query)}
                    title="Search this item"
                  >
                    🔍
                  </button>
                  <button 
                    className="copy-btn"
                    onClick={() => copySearchQuery(query.query)}
                    title="Copy this item"
                  >
                    📋
                  </button>
                  <button 
                    className="delete-btn"
                    onClick={() => deleteSearch(query.id)}
                    title="Delete this item"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">💭</div>
          <div className="empty-title">No Saved Items</div>
          <div className="empty-message">Use Alt+Shift+S to save thoughts and ideas for later</div>
        </div>
      )}

      {/* Quick Actions - Minimal, Essential */}
      <div className="quick-actions">
        {hasSearches && config?.smartSearch?.searchAllEnabled && (
          <button 
            className="action-btn primary"
            onClick={performAllSearches}
            title="Search all saved items"
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
  ReactDOM.render(
    <ErrorBoundary>
      <Popup />
    </ErrorBoundary>,
    root
  );
} 