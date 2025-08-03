import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import ErrorBoundary from './components/ErrorBoundary';
import LoadingSpinner from './components/LoadingSpinner';
import { ExtensionConfig, DistractingDomain, Habit, Pillar, DEFAULT_CONFIG } from './types';
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

interface HabitEntry {
  habitId: string;
  date: string;
  status: 'excellent' | 'good' | 'not_done';
}

const Popup: React.FC = () => {
  const [data, setData] = useState<StorageData | null>(null);
  const [countdown, setCountdown] = useState<string>('--:--');
  const [searchStatus, setSearchStatus] = useState<'idle' | 'searching' | 'completed'>('idle');
  const [searchingQuery, setSearchingQuery] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');
  const [copiedItem, setCopiedItem] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'main' | 'focus' | 'blocker' | 'care'>('main');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  
  // Settings form states
  const [newDomain, setNewDomain] = useState('');
  const [newDomainLimit, setNewDomainLimit] = useState(3);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#007aff');
  const [newPillarQuote, setNewPillarQuote] = useState('');
  const [newPillarDescription, setNewPillarDescription] = useState('');
  const [newPillarColor, setNewPillarColor] = useState('#007aff');

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

  const updateConfig = async (path: string, value: any) => {
    if (!data?.config) return;
    
    const newConfig = { ...data.config };
    const keys = path.split('.');
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setData({ ...data, config: newConfig });
    
    // Auto-save immediately
    await saveConfig(newConfig);
  };

  const saveConfig = async (configToSave?: ExtensionConfig) => {
    const configToUse = configToSave || data?.config;
    if (!configToUse) return;
    
    setSaveStatus('saving');
    try {
      const response = await chrome.runtime.sendMessage({ type: 'UPDATE_CONFIG', config: configToUse });
      if (response && response.success) {
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error auto-saving config:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const addHabit = async () => {
    if (!data?.config) return;
    
    const habitName = newHabitName.trim();
    if (habitName) {
      // Check for duplicates
      const existingHabit = data.config.focusPage.habits.find(
        h => h.name.toLowerCase() === habitName.toLowerCase()
      );
      
      if (existingHabit) {
        // Show error feedback
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 2000);
        return;
      }

      const newHabit: Habit = {
        id: Date.now().toString(),
        name: habitName,
        color: newHabitColor
      };
      
      const updatedConfig = {
        ...data.config,
        focusPage: {
          ...data.config.focusPage,
          habits: [newHabit, ...data.config.focusPage.habits]
        }
      };
      
      setData({ ...data, config: updatedConfig });
      await saveConfig(updatedConfig);
      setNewHabitName('');
      setNewHabitColor('#007aff');
    }
  };

  const updateHabit = async (index: number, updates: Partial<Habit>) => {
    if (!data?.config) return;
    
    const habits = [...data.config.focusPage.habits];
    habits[index] = { ...habits[index], ...updates };
    
    const updatedConfig = {
      ...data.config,
      focusPage: {
        ...data.config.focusPage,
        habits
      }
    };
    
    setData({ ...data, config: updatedConfig });
    await saveConfig(updatedConfig);
  };

  const removeHabit = async (index: number) => {
    if (!data?.config) return;
    
    const habits = data.config.focusPage.habits.filter((_, i) => i !== index);
    const updatedConfig = {
      ...data.config,
      focusPage: {
        ...data.config.focusPage,
        habits
      }
    };
    
    setData({ ...data, config: updatedConfig });
    await saveConfig(updatedConfig);
  };

  const addPillar = async () => {
    if (!data?.config) return;
    
    const pillarQuote = newPillarQuote.trim();
    const pillarDescription = newPillarDescription.trim();
    if (pillarQuote) {
      // Check for duplicates
      const existingPillar = data.config.focusPage.pillars.find(
        p => p.quote.toLowerCase() === pillarQuote.toLowerCase()
      );
      
      if (existingPillar) {
        // Show error feedback
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 2000);
        return;
      }

      const newPillar: Pillar = {
        id: Date.now().toString(),
        quote: pillarQuote,
        description: pillarDescription || "Your core principle",
        color: newPillarColor
      };
      
      const updatedConfig = {
        ...data.config,
        focusPage: {
          ...data.config.focusPage,
          pillars: [newPillar, ...data.config.focusPage.pillars]
        }
      };
      
      setData({ ...data, config: updatedConfig });
      await saveConfig(updatedConfig);
      setNewPillarQuote('');
      setNewPillarDescription('');
      setNewPillarColor('#007aff');
    }
  };

  const updatePillar = async (index: number, updates: Partial<Pillar>) => {
    if (!data?.config) return;
    
    const pillars = [...data.config.focusPage.pillars];
    pillars[index] = { ...pillars[index], ...updates };
    
    const updatedConfig = {
      ...data.config,
      focusPage: {
        ...data.config.focusPage,
        pillars
      }
    };
    
    setData({ ...data, config: updatedConfig });
    await saveConfig(updatedConfig);
  };

  const removePillar = async (index: number) => {
    if (!data?.config) return;
    
    const pillars = data.config.focusPage.pillars.filter((_, i) => i !== index);
    const updatedConfig = {
      ...data.config,
      focusPage: {
        ...data.config.focusPage,
        pillars
      }
    };
    
    setData({ ...data, config: updatedConfig });
    await saveConfig(updatedConfig);
  };

  const addDomain = async () => {
    if (!data?.config) return;
    
    const domainName = newDomain.trim().toLowerCase();
    if (domainName && newDomainLimit > 0) {
      // Check for duplicates
      const existingDomain = data.config.distractionBlocker.domains.find(
        d => d.domain.toLowerCase() === domainName
      );
      
      if (existingDomain) {
        // Show error feedback
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 2000);
        return;
      }

      const newDomainObj: DistractingDomain = {
        domain: domainName,
        dailyLimit: newDomainLimit,
        currentCount: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
      };
      
      const updatedConfig = {
        ...data.config,
        distractionBlocker: {
          ...data.config.distractionBlocker,
          domains: [newDomainObj, ...data.config.distractionBlocker.domains]
        }
      };
      
      setData({ ...data, config: updatedConfig });
      await saveConfig(updatedConfig);
      setNewDomain('');
      setNewDomainLimit(3);
    }
  };

  const removeDomain = async (index: number) => {
    if (!data?.config) return;
    
    const domains = data.config.distractionBlocker.domains.filter((_, i) => i !== index);
    const updatedConfig = {
      ...data.config,
      distractionBlocker: {
        ...data.config.distractionBlocker,
        domains
      }
    };
    
    setData({ ...data, config: updatedConfig });
    await saveConfig(updatedConfig);
  };

  const performSearch = async (query: SearchQuery) => {
    try {
      setSearchStatus('searching');
      setSearchingQuery(query.query);
      
      // Immediately remove the item from the list when search button is clicked
      await chrome.runtime.sendMessage({ type: 'DELETE_SEARCH', id: query.id });
      
      // Immediately update local state to remove the item
      if (data) {
        const updatedSearches = data.savedSearches.filter(s => s.id !== query.id);
        setData({ ...data, savedSearches: updatedSearches });
      }
      
      // Perform the search
      const searchUrl = `https://www.google.com/search?q=${encodeURIComponent(query.query)}`;
      await chrome.tabs.create({ url: searchUrl });
      
      setSearchStatus('completed');
      setTimeout(() => {
        setSearchStatus('idle');
        setSearchingQuery('');
      }, 1500);
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
      
      // Immediately update local state to clear all items
      if (data) {
        setData({ ...data, savedSearches: [] });
      }
      
      setSearchStatus('completed');
      setTimeout(() => {
        setSearchStatus('idle');
        setSearchingQuery('');
      }, 1500);
    } catch (error) {
      console.error('Error performing all searches:', error);
      setSearchStatus('idle');
      setSearchingQuery('');
    }
  };

  const deleteSearch = async (id: string) => {
    try {
      await chrome.runtime.sendMessage({ type: 'DELETE_SEARCH', id });
      
      // Immediately update local state to remove the item
      if (data) {
        const updatedSearches = data.savedSearches.filter(s => s.id !== id);
        setData({ ...data, savedSearches: updatedSearches });
      }
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

  // Helper function to check if a feature is active
  const isFeatureActive = (feature: string) => {
    switch (feature) {
      case 'smartSearch':
        return config?.smartSearch?.enabled;
      case 'distractionBlocker':
        return config?.distractionBlocker?.enabled;
      case 'eyeCare':
        return config?.eyeCare?.enabled;
      case 'tabLimiter':
        return (config?.tabLimiter?.maxTabs || 0) > 0;
      default:
        return false;
    }
  };

  const renderMainTab = () => (
    <>
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

      {/* Apple Watch Style Header - Essential Metrics with Status Indicators */}
      <div className="watch-header">
        <div className="metric-group">
          {isFeatureActive('eyeCare') && (
            <div className="metric-item" title='Eye Care'>
              <div className="metric-icon">👁</div>
              <div className="metric-value">{countdown}</div>
            </div>
          )}
          {isFeatureActive('tabLimiter') && (
            <div className="metric-item" title='Tab Limiter'>
              <div className="metric-icon">📑</div>
              <div className="metric-value">{tabCount}/{config?.tabLimiter?.maxTabs || 3}</div>
            </div>
          )}
          {isFeatureActive('smartSearch') && (
            <div className="metric-item" title='Smart Search'>
              <div className="metric-icon">💭</div>
              <div className="metric-value">{savedSearches.length}</div>
            </div>
          )}
          {isFeatureActive('distractionBlocker') && (
            <div className="metric-item" title='Distraction Blocker'>
              <div className="metric-icon">🚫</div>
              <div className="metric-value">{config?.distractionBlocker?.domains?.length || 0}</div>
            </div>
          )}
        </div>
        
        {/* Save Status Indicator */}
        {saveStatus !== 'idle' && (
          <div className={`save-status ${saveStatus}`}>
            {saveStatus === 'saving' && <span className="save-icon">⏳</span>}
            {saveStatus === 'saved' && <span className="save-icon">✓</span>}
            {saveStatus === 'error' && <span className="save-icon">✕</span>}
          </div>
        )}
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
            onClick={() => setActiveTab('focus')}
            title="Focus Settings"
          >
            ⚙️ Settings
          </button>
        </div>
      </div>
    </>
  );

  const renderFocusTab = () => (
    <div className="settings-content">
      <div className="settings-header">
        <button className="back-btn" onClick={() => setActiveTab('main')}>←</button>
        <h3>Focus Settings</h3>
      </div>
      
      <div className="settings-section">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={config?.smartSearch?.enabled}
            onChange={(e) => updateConfig('smartSearch.enabled', e.target.checked)}
          />
          <span className="toggle-slider"></span>
          Save Thoughts
        </label>
      </div>

      <div className="settings-section">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={config?.smartSearch?.searchAllEnabled}
            onChange={(e) => updateConfig('smartSearch.searchAllEnabled', e.target.checked)}
          />
          <span className="toggle-slider"></span>
          Search All Feature
        </label>
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h4>Habits ({config?.focusPage?.habits?.length || 0}/5)</h4>
          <span className="section-subtitle">Track your daily routines</span>
        </div>
        
        {config?.focusPage?.habits?.length > 0 ? (
          <div className="scrollable-list">
            {config.focusPage.habits.map((habit, index) => (
              <div key={index} className="list-item">
                <input
                  type="text"
                  value={habit.name}
                  onChange={(e) => updateHabit(index, { name: e.target.value })}
                  placeholder="Habit name"
                  maxLength={20}
                  className="item-input"
                />
                <input
                  type="color"
                  value={habit.color}
                  onChange={(e) => updateHabit(index, { color: e.target.value })}
                  className="color-input"
                />
                <button
                  className="remove-btn"
                  onClick={() => removeHabit(index)}
                  title="Remove habit"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-list">
            <div className="empty-icon">📊</div>
            <div className="empty-title">No Habits</div>
            <div className="empty-message">Add habits to track your daily progress</div>
          </div>
        )}

        {config?.focusPage?.habits?.length < 5 && (
          <div className="add-item">
            <input
              type="text"
              placeholder="Add habit"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              maxLength={20}
              className="add-input"
            />
            <input
              type="color"
              value={newHabitColor}
              onChange={(e) => setNewHabitColor(e.target.value)}
              className="color-input"
            />
            <button className="add-btn" onClick={addHabit} title="Add habit">+</button>
          </div>
        )}
      </div>

      <div className="settings-section">
        <div className="section-header">
          <h4>Pillars ({config?.focusPage?.pillars?.length || 0}/3)</h4>
          <span className="section-subtitle">Your core principles</span>
        </div>
        
        {config?.focusPage?.pillars?.length > 0 ? (
          <div className="scrollable-list">
            {config.focusPage.pillars.map((pillar, index) => (
              <div key={index} className="list-item">
                <input
                  type="text"
                  value={pillar.quote}
                  onChange={(e) => updatePillar(index, { quote: e.target.value })}
                  placeholder="EXECUTE. NOW."
                  maxLength={15}
                  className="item-input"
                />
                <input
                  type="color"
                  value={pillar.color}
                  onChange={(e) => updatePillar(index, { color: e.target.value })}
                  className="color-input"
                />
                <button
                  className="remove-btn"
                  onClick={() => removePillar(index)}
                  title="Remove pillar"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-list">
            <div className="empty-icon">🎯</div>
            <div className="empty-title">No Pillars</div>
            <div className="empty-message">Add pillars to guide your focus</div>
          </div>
        )}

        {config?.focusPage?.pillars?.length < 3 && (
          <div className="add-item">
            <input
              type="text"
              placeholder="Add pillar"
              value={newPillarQuote}
              onChange={(e) => setNewPillarQuote(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPillar()}
              maxLength={15}
              className="add-input"
            />
            <input
              type="color"
              value={newPillarColor}
              onChange={(e) => setNewPillarColor(e.target.value)}
              className="color-input"
            />
            <button className="add-btn" onClick={addPillar} title="Add pillar">+</button>
          </div>
        )}
      </div>
    </div>
  );

  const renderBlockerTab = () => (
    <div className="settings-content">
      <div className="settings-header">
        <button className="back-btn" onClick={() => setActiveTab('main')}>←</button>
        <h3>Blocker Settings</h3>
      </div>
      
      <div className="settings-section">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={config?.distractionBlocker?.enabled}
            onChange={(e) => updateConfig('distractionBlocker.enabled', e.target.checked)}
          />
          <span className="toggle-slider"></span>
          Distraction Blocker
        </label>
      </div>

      {config?.distractionBlocker?.enabled && (
        <div className="settings-section">
          <div className="section-header">
            <h4>Domains ({config?.distractionBlocker?.domains?.length || 0})</h4>
            <span className="section-subtitle">Limit daily visits to distracting sites</span>
          </div>
          
          {config?.distractionBlocker?.domains?.length > 0 ? (
            <div className="scrollable-list">
              {config.distractionBlocker.domains.map((domain, index) => (
                <div key={index} className="list-item">
                  <div className="domain-info">
                    <div className="domain-name">{domain.domain}</div>
                    <div className="domain-limit">{domain.dailyLimit}/day</div>
                  </div>
                  <button
                    className="remove-btn"
                    onClick={() => removeDomain(index)}
                    title="Remove domain"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-list">
              <div className="empty-icon">🚫</div>
              <div className="empty-title">No Domains</div>
              <div className="empty-message">Add domains to block distractions</div>
            </div>
          )}

          <div className="add-item">
            <input
              type="text"
              placeholder="facebook.com"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addDomain()}
              maxLength={20}
              className="add-input"
            />
            <input
              type="number"
              placeholder="3"
              value={newDomainLimit}
              onChange={(e) => setNewDomainLimit(parseInt(e.target.value) || 0)}
              min="1"
              max="10"
              className="limit-input"
            />
            <button className="add-btn" onClick={addDomain} title="Add domain">+</button>
          </div>
        </div>
      )}

      <div className="settings-section">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={(config?.tabLimiter?.maxTabs || 0) > 0}
            onChange={(e) => updateConfig('tabLimiter.maxTabs', e.target.checked ? 3 : 0)}
          />
          <span className="toggle-slider"></span>
          Tab Limiter
        </label>
      </div>

      {(config?.tabLimiter?.maxTabs || 0) > 0 && (
        <div className="settings-section">
          <div className="tab-limit-section">
            <input
              type="number"
              value={config?.tabLimiter?.maxTabs || 3}
              onChange={(e) => updateConfig('tabLimiter.maxTabs', parseInt(e.target.value))}
              min="1"
              max="10"
              className="tab-limit-input"
            />
            <span className="tab-limit-label">max tabs</span>
          </div>
        </div>
      )}
    </div>
  );

  const renderCareTab = () => (
    <div className="settings-content">
      <div className="settings-header">
        <button className="back-btn" onClick={() => setActiveTab('main')}>←</button>
        <h3>Care Settings</h3>
      </div>
      
      <div className="settings-section">
        <label className="toggle-label">
          <input
            type="checkbox"
            checked={config?.eyeCare?.enabled}
            onChange={(e) => updateConfig('eyeCare.enabled', e.target.checked)}
          />
          <span className="toggle-slider"></span>
          20-20-20 Reminder
        </label>
      </div>

      {config?.eyeCare?.enabled && (
        <div className="settings-section">
          <div className="volume-section">
            <div className="volume-display">
              {Math.round((config?.eyeCare?.soundVolume || 0.5) * 100)}%
            </div>
            <input
              type="range"
              min="0"
              max="1"
              step="0.1"
              value={config?.eyeCare?.soundVolume || 0.5}
              onChange={(e) => updateConfig('eyeCare.soundVolume', parseFloat(e.target.value))}
              className="volume-slider"
            />
          </div>
        </div>
      )}
    </div>
  );

  return (
    <div className="popup-container">
      {/* Tab Navigation */}
      {activeTab !== 'main' && (
        <div className="tab-navigation">
          <button 
            className={`tab-btn ${activeTab === 'focus' ? 'active' : ''}`}
            onClick={() => setActiveTab('focus')}
          >
            Focus
          </button>
          <button 
            className={`tab-btn ${activeTab === 'blocker' ? 'active' : ''}`}
            onClick={() => setActiveTab('blocker')}
          >
            Blocker
          </button>
          <button 
            className={`tab-btn ${activeTab === 'care' ? 'active' : ''}`}
            onClick={() => setActiveTab('care')}
          >
            Care
          </button>
        </div>
      )}

      {/* Content based on active tab */}
      {activeTab === 'main' && renderMainTab()}
      {activeTab === 'focus' && renderFocusTab()}
      {activeTab === 'blocker' && renderBlockerTab()}
      {activeTab === 'care' && renderCareTab()}
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