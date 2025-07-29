import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ExtensionConfig, DistractingDomain, Habit } from './types';
import './options.scss';

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

interface OptionsProps {}

const Options: React.FC<OptionsProps> = () => {
  const [config, setConfig] = useState<ExtensionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    loadConfig();
  }, []);

  const loadConfig = async () => {
    try {
      console.log('Loading options config...');
      const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
      console.log('Received options data:', response);
      
      // Set default config regardless of response
      setConfig(defaultConfig);
      
      // If we got a valid response with config, use it
      if (response && typeof response === 'object' && response.config) {
        setConfig(response.config);
      }
    } catch (error) {
      console.error('Error loading config:', error);
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const saveConfig = async () => {
    if (!config) return;
    
    try {
      setLoading(true);
      await chrome.runtime.sendMessage({ type: 'UPDATE_CONFIG', config });
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      console.log('Config saved successfully');
    } catch (error) {
      console.error('Error saving config:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateConfig = (updates: Partial<ExtensionConfig>) => {
    if (!config) return;
    setConfig({ ...config, ...updates });
  };

  const addDistractingDomain = () => {
    if (!config) return;
    
    const newDomain: DistractingDomain = {
      domain: '',
      dailyLimit: 3,
      currentCount: 0,
      lastResetDate: new Date().toISOString().split('T')[0]
    };
    
    updateConfig({
      distractionBlocker: {
        ...config.distractionBlocker,
        domains: [...config.distractionBlocker.domains, newDomain]
      }
    });
  };

  const updateDistractingDomain = (index: number, updates: Partial<DistractingDomain>) => {
    if (!config) return;
    
    const domains = [...config.distractionBlocker.domains];
    domains[index] = { ...domains[index], ...updates };
    
    updateConfig({
      distractionBlocker: {
        ...config.distractionBlocker,
        domains
      }
    });
  };

  const removeDistractingDomain = (index: number) => {
    if (!config) return;
    
    const domains = config.distractionBlocker.domains.filter((_, i) => i !== index);
    updateConfig({
      distractionBlocker: {
        ...config.distractionBlocker,
        domains
      }
    });
  };

  const addHabit = () => {
    if (!config) return;
    
    const newHabit: Habit = {
      id: Date.now().toString(),
      name: '',
      color: '#3b82f6'
    };
    
    updateConfig({
      focusPage: {
        ...config.focusPage,
        habits: [...config.focusPage.habits, newHabit]
      }
    });
  };

  const updateHabit = (index: number, updates: Partial<Habit>) => {
    if (!config) return;
    
    const habits = [...config.focusPage.habits];
    habits[index] = { ...habits[index], ...updates };
    
    updateConfig({
      focusPage: {
        ...config.focusPage,
        habits
      }
    });
  };

  const removeHabit = (index: number) => {
    if (!config) return;
    
    const habits = config.focusPage.habits.filter((_, i) => i !== index);
    updateConfig({
      focusPage: {
        ...config.focusPage,
        habits
      }
    });
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
    <div className="options">
      <div className="options-header">
        <h1>Unwavering Focus - Options</h1>
        <button 
          className={`save-btn ${saved ? 'saved' : ''}`}
          onClick={saveConfig}
        >
          {saved ? 'Saved!' : 'Save Changes'}
        </button>
      </div>

      <div className="options-content">
        {/* Smart Search Management */}
        <section className="option-section">
          <h2>Smart Search Management</h2>
          <div className="option-item">
            <label>
              <input
                type="checkbox"
                checked={configToUse.smartSearch.enabled}
                onChange={(e) => updateConfig({
                  smartSearch: { ...configToUse.smartSearch, enabled: e.target.checked }
                })}
              />
              Enable Smart Search Management
            </label>
            <p className="option-description">
              Use Alt+Shift+S to save search queries for later. Access them from the extension popup.
            </p>
          </div>
        </section>

        {/* Distraction Blocker */}
        <section className="option-section">
          <h2>Distraction Blocker</h2>
          <div className="option-item">
            <label>
              <input
                type="checkbox"
                checked={configToUse.distractionBlocker.enabled}
                onChange={(e) => updateConfig({
                  distractionBlocker: { ...configToUse.distractionBlocker, enabled: e.target.checked }
                })}
              />
              Enable Distraction Blocker
            </label>
            <p className="option-description">
              Block access to distracting websites after reaching daily limits.
            </p>
          </div>

          {configToUse.distractionBlocker.enabled && (
            <div className="domains-list">
              <h3>Distracting Domains</h3>
              {configToUse.distractionBlocker.domains.map((domain, index) => (
                <div key={index} className="domain-item">
                  <input
                    type="text"
                    placeholder="Domain (e.g., facebook.com)"
                    value={domain.domain}
                    onChange={(e) => updateDistractingDomain(index, { domain: e.target.value })}
                  />
                  <input
                    type="number"
                    min="1"
                    max="50"
                    placeholder="Daily limit"
                    value={domain.dailyLimit}
                    onChange={(e) => updateDistractingDomain(index, { dailyLimit: parseInt(e.target.value) || 1 })}
                  />
                  <button
                    className="remove-btn"
                    onClick={() => removeDistractingDomain(index)}
                  >
                    Remove
                  </button>
                </div>
              ))}
              <button className="add-btn" onClick={addDistractingDomain}>
                Add Domain
              </button>
            </div>
          )}
        </section>

        {/* Eye Care */}
        <section className="option-section">
          <h2>Eye Care Reminder</h2>
          <div className="option-item">
            <label>
              <input
                type="checkbox"
                checked={configToUse.eyeCare.enabled}
                onChange={(e) => updateConfig({
                  eyeCare: { ...configToUse.eyeCare, enabled: e.target.checked }
                })}
              />
              Enable 20-20-20 Eye Care Reminder
            </label>
            <p className="option-description">
              Get reminded every 20 minutes to look 20 feet away for 20 seconds.
            </p>
          </div>

          {configToUse.eyeCare.enabled && (
            <div className="option-item">
              <label>
                Sound Volume:
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={configToUse.eyeCare.soundVolume}
                  onChange={(e) => updateConfig({
                    eyeCare: { ...configToUse.eyeCare, soundVolume: parseFloat(e.target.value) }
                  })}
                />
                {Math.round(configToUse.eyeCare.soundVolume * 100)}%
              </label>
              <button 
                className="test-btn"
                onClick={async () => {
                  try {
                    await chrome.runtime.sendMessage({ type: 'TEST_EYE_CARE' });
                    console.log('Eye care test triggered');
                  } catch (error) {
                    console.error('Error testing eye care:', error);
                  }
                }}
              >
                Test Eye Care Reminder
              </button>
            </div>
          )}
        </section>

        {/* Tab Limiter */}
        <section className="option-section">
          <h2>Tab Limiter</h2>
          <div className="option-item">
            <label>
              Maximum Tabs:
              <input
                type="number"
                min="1"
                max="50"
                value={configToUse.tabLimiter.maxTabs}
                onChange={(e) => updateConfig({
                  tabLimiter: { ...configToUse.tabLimiter, maxTabs: parseInt(e.target.value) || 1 }
                })}
              />
            </label>
            <p className="option-description">
              Maximum number of tabs allowed. Older tabs will be closed when limit is exceeded.
            </p>
          </div>

          <div className="option-item">
            <label>
              Excluded Domains (comma-separated):
              <input
                type="text"
                placeholder="google.com, mail.google.com"
                value={configToUse.tabLimiter.excludedDomains.join(', ')}
                onChange={(e) => updateConfig({
                  tabLimiter: { 
                    ...configToUse.tabLimiter, 
                    excludedDomains: e.target.value.split(',').map(d => d.trim()).filter(Boolean)
                  }
                })}
              />
            </label>
            <p className="option-description">
              Tabs from these domains won't count towards the limit.
            </p>
          </div>
        </section>

        {/* Focus Page */}
        <section className="option-section">
          <h2>Focus Page</h2>
          <div className="option-item">
            <label>
              Motivational Message:
              <textarea
                value={configToUse.focusPage.motivationalMessage}
                onChange={(e) => updateConfig({
                  focusPage: { ...configToUse.focusPage, motivationalMessage: e.target.value }
                })}
                placeholder="Enter your motivational message..."
              />
            </label>
          </div>

          <div className="option-item">
            <h3>Pillar Habits</h3>
            <p className="option-description">
              Define your key habits to track daily performance.
            </p>
            
            {configToUse.focusPage.habits.map((habit, index) => (
              <div key={habit.id} className="habit-item">
                <input
                  type="text"
                  placeholder="Habit name"
                  value={habit.name}
                  onChange={(e) => updateHabit(index, { name: e.target.value })}
                />
                <input
                  type="color"
                  value={habit.color}
                  onChange={(e) => updateHabit(index, { color: e.target.value })}
                />
                <button
                  className="remove-btn"
                  onClick={() => removeHabit(index)}
                >
                  Remove
                </button>
              </div>
            ))}
            <button className="add-btn" onClick={addHabit}>
              Add Habit
            </button>
          </div>

          <div className="option-item">
            <h3>Reinforcement Messages</h3>
            <div className="message-inputs">
              <label>
                High Performance (greater than 80%):
                <input
                  type="text"
                  value={configToUse.focusPage.reinforcementMessages.high}
                  onChange={(e) => updateConfig({
                    focusPage: {
                      ...configToUse.focusPage,
                      reinforcementMessages: {
                        ...configToUse.focusPage.reinforcementMessages,
                        high: e.target.value
                      }
                    }
                  })}
                />
              </label>
              <label>
                Medium Performance (50-80%):
                <input
                  type="text"
                  value={configToUse.focusPage.reinforcementMessages.medium}
                  onChange={(e) => updateConfig({
                    focusPage: {
                      ...configToUse.focusPage,
                      reinforcementMessages: {
                        ...configToUse.focusPage.reinforcementMessages,
                        medium: e.target.value
                      }
                    }
                  })}
                />
              </label>
                              <label>
                  Low Performance (less than 50%):
                  <input
                    type="text"
                    value={configToUse.focusPage.reinforcementMessages.low}
                    onChange={(e) => updateConfig({
                      focusPage: {
                        ...configToUse.focusPage,
                        reinforcementMessages: {
                          ...configToUse.focusPage.reinforcementMessages,
                          low: e.target.value
                        }
                      }
                    })}
                  />
                </label>
            </div>
          </div>
        </section>
      </div>
    </div>
  );
};

// Render the options page
const root = document.getElementById('root');
if (root) {
  ReactDOM.render(<Options />, root);
} 