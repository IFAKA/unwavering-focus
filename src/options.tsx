import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ExtensionConfig, DistractingDomain, Habit, Pillar } from './types';
import './options.scss';

// Define default config locally
const defaultConfig: ExtensionConfig = {
  smartSearch: { 
    enabled: true,
    searchAllEnabled: false 
  },
  distractionBlocker: { enabled: true, domains: [] },
  eyeCare: { enabled: true, soundVolume: 0.5 },
  tabLimiter: { maxTabs: 3, excludedDomains: [] },
  focusPage: {
    motivationalMessage: "Enfócate. Tu tiempo es oro.",
    habits: [],
    pillars: [],
    reinforcementMessages: {
      high: "Your discipline forges your excellence.",
      medium: "Stay consistent. Progress builds momentum.",
      low: "Regain control. Small actions today build momentum."
    }
  },
  youtubeDistraction: {
    hideSecondary: true,
    hideMasthead: true,
    hideOwner: true,
    hideButtonShape: true,
    hideAuthorThumbnail: true,
    hideSegmentedButtons: true,
    hideGridShelf: true,
    hideMiniGuide: true,
    hideSections: true,
    hideStart: true,
    hideButtons: true
  }
};

interface OptionsProps {}

const Options: React.FC<OptionsProps> = () => {
  const [config, setConfig] = useState<ExtensionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [newDomain, setNewDomain] = useState('');
  const [newDomainLimit, setNewDomainLimit] = useState(3);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#3b82f6');
  const [newPillarQuote, setNewPillarQuote] = useState('');
  const [newPillarDescription, setNewPillarDescription] = useState('');
  const [newPillarColor, setNewPillarColor] = useState('#007aff');

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      setLoading(true);
      const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
      console.log('Options page received response:', response);
      if (response && response.config) {
        setConfig(response.config);
      } else {
        console.log('No config in response, using default');
        setConfig(defaultConfig);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (path: string, value: any) => {
    if (!config) return;
    
    const newConfig = { ...config };
    const keys = path.split('.');
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
  };

  const saveConfig = async () => {
    if (!config) return;
    try {
      await chrome.runtime.sendMessage({ type: 'UPDATE_CONFIG', config });
      console.log('Config auto-saved successfully');
    } catch (error) {
      console.error('Error auto-saving config:', error);
    }
  };

  const addDomain = () => {
    if (!config) return;
    
    const domainName = newDomain.trim();
    if (domainName && newDomainLimit > 0) {
      const newDomainObj: DistractingDomain = {
        domain: domainName,
        dailyLimit: newDomainLimit,
        currentCount: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
      };
      
      updateConfig('distractionBlocker.domains', [...config.distractionBlocker.domains, newDomainObj]);
      setNewDomain('');
      setNewDomainLimit(3);
    }
  };

  const removeDomain = (index: number) => {
    if (!config) return;
    
    const domains = config.distractionBlocker.domains.filter((_, i) => i !== index);
    updateConfig('distractionBlocker.domains', domains);
  };

  const addHabit = () => {
    if (!config) return;
    
    const habitName = newHabitName.trim();
    if (habitName) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: habitName,
        color: newHabitColor
      };
      
      updateConfig('focusPage.habits', [...config.focusPage.habits, newHabit]);
      setNewHabitName('');
      setNewHabitColor('#3b82f6');
    }
  };

  const updateHabit = (index: number, updates: Partial<Habit>) => {
    if (!config) return;
    
    const habits = [...config.focusPage.habits];
    habits[index] = { ...habits[index], ...updates };
    
    updateConfig('focusPage.habits', habits);
  };

  const removeHabit = (index: number) => {
    if (!config) return;
    
    const habits = config.focusPage.habits.filter((_, i) => i !== index);
    updateConfig('focusPage.habits', habits);
  };

  // Pillar management functions
  const addPillar = () => {
    if (!config) return;
    
    const pillarQuote = newPillarQuote.trim();
    const pillarDescription = newPillarDescription.trim();
    if (pillarQuote) {
      const newPillar: Pillar = {
        id: Date.now().toString(),
        quote: pillarQuote,
        description: pillarDescription || "Your core principle",
        color: newPillarColor
      };
      
      updateConfig('focusPage.pillars', [...config.focusPage.pillars, newPillar]);
      setNewPillarQuote('');
      setNewPillarDescription('');
      setNewPillarColor('#007aff');
    }
  };

  const updatePillar = (index: number, updates: Partial<Pillar>) => {
    if (!config) return;
    
    const pillars = [...config.focusPage.pillars];
    pillars[index] = { ...pillars[index], ...updates };
    updateConfig('focusPage.pillars', pillars);
  };

  const removePillar = (index: number) => {
    if (!config) return;
    
    const pillars = config.focusPage.pillars.filter((_, i) => i !== index);
    updateConfig('focusPage.pillars', pillars);
  };

  if (loading) {
    return (
      <div className="options">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Always show the UI with default config if no config is loaded
  const configToUse = config || defaultConfig;

  return (
    <div className="container">
      <div className="header">
        <h1>⚙️ Extension Settings</h1>
        <p>Configure your focus and productivity preferences</p>
      </div>

        {/* Smart Search Management */}
        <div className="section">
          <h3>Smart Search Management</h3>
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config?.smartSearch?.enabled || false}
                onChange={(e) => updateConfig('smartSearch.enabled', e.target.checked)}
              />
              <span className="checkmark"></span>
              Enable Smart Search
            </label>
            <p className="help-text">Save search queries for later with Alt+Shift+S</p>
          </div>
          
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={config?.smartSearch?.searchAllEnabled || false}
                onChange={(e) => updateConfig('smartSearch.searchAllEnabled', e.target.checked)}
              />
              <span className="checkmark"></span>
              Enable "Search All" Button
            </label>
            <p className="help-text">Allow searching all saved queries at once</p>
          </div>
        </div>

      <div className="section">
        <h2><span className="section-icon">🚫</span>Distraction Blocker</h2>
        <div className="form-group">
          <div className="toggle-group">
            <input
              type="checkbox"
              id="distractionBlockerEnabled"
              checked={config?.distractionBlocker?.enabled || false}
              onChange={(e) => updateConfig('distractionBlocker.enabled', e.target.checked)}
            />
            <label htmlFor="distractionBlockerEnabled">Enable Distraction Blocker</label>
          </div>
          <p className="option-description">
            Block distracting websites and limit daily visits to maintain focus.
          </p>
        </div>

        {config?.distractionBlocker?.enabled && (
          <div className="domain-management">
            <h3>Distracting Domains</h3>
            <div className="add-domain-form">
              <input
                type="text"
                placeholder="Enter domain (e.g., facebook.com)"
                value={newDomain}
                onChange={(e) => setNewDomain(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && addDomain()}
              />
              <input
                type="number"
                placeholder="Daily limit"
                value={newDomainLimit}
                onChange={(e) => setNewDomainLimit(parseInt(e.target.value) || 0)}
                min="1"
                max="50"
              />
              <button className="btn btn-primary" onClick={addDomain}>
                Add Domain
              </button>
            </div>

            <div className="domain-list">
              {config.distractionBlocker.domains.map((domain, index) => (
                <div key={index} className="domain-item">
                  <div className="domain-info">
                    <div className="domain-name">{domain.domain}</div>
                    <div className="domain-limit">{domain.dailyLimit} visits per day</div>
                  </div>
                  <div className="domain-actions">
                    <button
                      className="btn btn-danger btn-small"
                      onClick={() => removeDomain(index)}
                    >
                      Remove
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      <div className="section">
        <h2><span className="section-icon">👁️</span>Eye Care Reminder</h2>
        <div className="form-group">
          <div className="toggle-group">
            <input
              type="checkbox"
              id="eyeCareEnabled"
              checked={config?.eyeCare?.enabled || false}
              onChange={(e) => updateConfig('eyeCare.enabled', e.target.checked)}
            />
            <label htmlFor="eyeCareEnabled">Enable 20-20-20 Eye Care Reminder</label>
          </div>
          <p className="option-description">
            Get reminded every 20 minutes to look 20 feet away for 20 seconds.
          </p>
        </div>

        {config?.eyeCare?.enabled && (
          <div className="form-group">
            <label htmlFor="soundVolume">Sound Volume</label>
            <input
              type="range"
              id="soundVolume"
              min="0"
              max="1"
              step="0.1"
              value={config.eyeCare.soundVolume}
              onChange={(e) => updateConfig('eyeCare.soundVolume', parseFloat(e.target.value))}
            />
            <div className="volume-display">{Math.round(config.eyeCare.soundVolume * 100)}%</div>
          </div>
        )}
      </div>

      <div className="section">
        <h2><span className="section-icon">📑</span>Tab Limiter</h2>
        <div className="form-group">
          <div className="toggle-group">
            <input
              type="checkbox"
              id="tabLimiterEnabled"
              checked={(config?.tabLimiter?.maxTabs || 0) > 0}
              onChange={(e) => updateConfig('tabLimiter.maxTabs', e.target.checked ? 3 : 0)}
            />
            <label htmlFor="tabLimiterEnabled">Enable Tab Limiter</label>
          </div>
          <p className="option-description">
            Limit the number of open tabs to prevent tab overload and maintain focus.
          </p>
        </div>

        {(config?.tabLimiter?.maxTabs || 0) > 0 && (
          <div className="form-group">
            <label htmlFor="maxTabs">Maximum Tabs</label>
            <input
              type="number"
              id="maxTabs"
              min="1"
              max="20"
              value={config?.tabLimiter?.maxTabs || 3}
              onChange={(e) => updateConfig('tabLimiter.maxTabs', parseInt(e.target.value))}
            />
          </div>
        )}
      </div>

      <div className="section">
        <h2><span className="section-icon">🎯</span>Focus Page</h2>
        <div className="form-group">
          <label htmlFor="motivationalMessage">Motivational Message</label>
          <input
            type="text"
            id="motivationalMessage"
            value={config?.focusPage?.motivationalMessage || ''}
            onChange={(e) => updateConfig('focusPage.motivationalMessage', e.target.value)}
            placeholder="Enter your motivational message"
          />
        </div>

        <div className="messages-section">
          <h3>Reinforcement Messages</h3>
          <div className="message-group">
            <label htmlFor="highMessage">High Performance Message</label>
            <textarea
              id="highMessage"
              value={config?.focusPage?.reinforcementMessages?.high || ''}
              onChange={(e) => updateConfig('focusPage.reinforcementMessages.high', e.target.value)}
              placeholder="Message shown when performance is high"
            />
          </div>
          <div className="message-group">
            <label htmlFor="mediumMessage">Medium Performance Message</label>
            <textarea
              id="mediumMessage"
              value={config?.focusPage?.reinforcementMessages?.medium || ''}
              onChange={(e) => updateConfig('focusPage.reinforcementMessages.medium', e.target.value)}
              placeholder="Message shown when performance is medium"
            />
          </div>
          <div className="message-group">
            <label htmlFor="lowMessage">Low Performance Message</label>
            <textarea
              id="lowMessage"
              value={config?.focusPage?.reinforcementMessages?.low || ''}
              onChange={(e) => updateConfig('focusPage.reinforcementMessages.low', e.target.value)}
              placeholder="Message shown when performance is low"
            />
          </div>
        </div>

        <div className="habits-section">
          <h3>Habits</h3>
          <p className="section-description">Define your daily habits to track progress and build consistency.</p>
          
          <div className="add-habit-form">
            <input
              type="text"
              placeholder="Enter habit name"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHabit()}
            />
            <input
              type="color"
              value={newHabitColor}
              onChange={(e) => setNewHabitColor(e.target.value)}
            />
            <button className="btn btn-primary" onClick={addHabit}>
              Add Habit
            </button>
          </div>

          <div className="habits-list">
            {config?.focusPage?.habits?.map((habit, index) => (
              <div key={index} className="habit-item">
                <div className="habit-inputs">
                  <input
                    type="text"
                    value={habit.name}
                    onChange={(e) => updateHabit(index, { name: e.target.value })}
                    placeholder="Habit name"
                  />
                  <input
                    type="color"
                    value={habit.color}
                    onChange={(e) => updateHabit(index, { color: e.target.value })}
                  />
                </div>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => removeHabit(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>

        <div className="pillars-section">
          <h3>Core Pillars</h3>
          <p className="section-description">Define your fundamental principles and triggers for focus.</p>
          
          <div className="add-pillar-form">
            <input
              type="text"
              placeholder="Enter pillar quote (e.g., EXECUTE. NOW.)"
              value={newPillarQuote}
              onChange={(e) => setNewPillarQuote(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPillar()}
            />
            <input
              type="text"
              placeholder="Enter description"
              value={newPillarDescription}
              onChange={(e) => setNewPillarDescription(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPillar()}
            />
            <input
              type="color"
              value={newPillarColor}
              onChange={(e) => setNewPillarColor(e.target.value)}
            />
            <button className="btn btn-primary" onClick={addPillar}>
              Add Pillar
            </button>
          </div>

          <div className="pillars-list">
            {config?.focusPage?.pillars?.map((pillar, index) => (
              <div key={index} className="pillar-item">
                <div className="pillar-inputs">
                  <input
                    type="text"
                    value={pillar.quote}
                    onChange={(e) => updatePillar(index, { quote: e.target.value })}
                    placeholder="Pillar quote (e.g., EXECUTE. NOW.)"
                  />
                  <input
                    type="text"
                    value={pillar.description}
                    onChange={(e) => updatePillar(index, { description: e.target.value })}
                    placeholder="Description"
                  />
                  <input
                    type="color"
                    value={pillar.color}
                    onChange={(e) => updatePillar(index, { color: e.target.value })}
                  />
                </div>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => removePillar(index)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Render the options page
const root = document.getElementById('root');
if (root) {
  ReactDOM.render(<Options />, root);
} 