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
  const [activeSection, setActiveSection] = useState<string>('focus');
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [newDomain, setNewDomain] = useState('');
  const [newDomainLimit, setNewDomainLimit] = useState(3);
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#007aff');
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

  const updateConfig = async (path: string, value: any) => {
    if (!config) return;
    
    const newConfig = { ...config };
    const keys = path.split('.');
    let current: any = newConfig;
    
    for (let i = 0; i < keys.length - 1; i++) {
      current = current[keys[i]];
    }
    
    current[keys[keys.length - 1]] = value;
    setConfig(newConfig);
    
    // Auto-save immediately
    await saveConfig(newConfig);
  };

  const saveConfig = async (configToSave?: ExtensionConfig) => {
    const configToUse = configToSave || config;
    if (!configToUse) return;
    
    setSaveStatus('saving');
    try {
      console.log('Saving config:', configToUse);
      const response = await chrome.runtime.sendMessage({ type: 'UPDATE_CONFIG', config: configToUse });
      console.log('Config save response:', response);
      if (response && response.success) {
        console.log('Config auto-saved successfully');
        setSaveStatus('saved');
        // Reset status after 2 seconds
        setTimeout(() => setSaveStatus('idle'), 2000);
      } else {
        console.error('Config save failed:', response);
        setSaveStatus('error');
        setTimeout(() => setSaveStatus('idle'), 3000);
      }
    } catch (error) {
      console.error('Error auto-saving config:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    }
  };

  const addDomain = async () => {
    if (!config) return;
    
    const domainName = newDomain.trim();
    if (domainName && newDomainLimit > 0) {
      const newDomainObj: DistractingDomain = {
        domain: domainName,
        dailyLimit: newDomainLimit,
        currentCount: 0,
        lastResetDate: new Date().toISOString().split('T')[0]
      };
      
      const updatedConfig = {
        ...config,
        distractionBlocker: {
          ...config.distractionBlocker,
          domains: [...config.distractionBlocker.domains, newDomainObj]
        }
      };
      
      setConfig(updatedConfig);
      await saveConfig(updatedConfig);
      setNewDomain('');
      setNewDomainLimit(3);
    }
  };

  const removeDomain = async (index: number) => {
    if (!config) return;
    
    const domains = config.distractionBlocker.domains.filter((_, i) => i !== index);
    const updatedConfig = {
      ...config,
      distractionBlocker: {
        ...config.distractionBlocker,
        domains
      }
    };
    
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
  };

  const addHabit = async () => {
    if (!config) return;
    
    const habitName = newHabitName.trim();
    if (habitName) {
      const newHabit: Habit = {
        id: Date.now().toString(),
        name: habitName,
        color: newHabitColor
      };
      
      const updatedConfig = {
        ...config,
        focusPage: {
          ...config.focusPage,
          habits: [...config.focusPage.habits, newHabit]
        }
      };
      
      setConfig(updatedConfig);
      await saveConfig(updatedConfig);
      setNewHabitName('');
      setNewHabitColor('#007aff');
    }
  };

  const updateHabit = async (index: number, updates: Partial<Habit>) => {
    if (!config) return;
    
    const habits = [...config.focusPage.habits];
    habits[index] = { ...habits[index], ...updates };
    
    const updatedConfig = {
      ...config,
      focusPage: {
        ...config.focusPage,
        habits
      }
    };
    
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
  };

  const removeHabit = async (index: number) => {
    if (!config) return;
    
    const habits = config.focusPage.habits.filter((_, i) => i !== index);
    const updatedConfig = {
      ...config,
      focusPage: {
        ...config.focusPage,
        habits
      }
    };
    
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
  };

  const addPillar = async () => {
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
      
      const updatedConfig = {
        ...config,
        focusPage: {
          ...config.focusPage,
          pillars: [...config.focusPage.pillars, newPillar]
        }
      };
      
      setConfig(updatedConfig);
      await saveConfig(updatedConfig);
      setNewPillarQuote('');
      setNewPillarDescription('');
      setNewPillarColor('#007aff');
    }
  };

  const updatePillar = async (index: number, updates: Partial<Pillar>) => {
    if (!config) return;
    
    const pillars = [...config.focusPage.pillars];
    pillars[index] = { ...pillars[index], ...updates };
    
    const updatedConfig = {
      ...config,
      focusPage: {
        ...config.focusPage,
        pillars
      }
    };
    
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
  };

  const removePillar = async (index: number) => {
    if (!config) return;
    
    const pillars = config.focusPage.pillars.filter((_, i) => i !== index);
    const updatedConfig = {
      ...config,
      focusPage: {
        ...config.focusPage,
        pillars
      }
    };
    
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
  };

  if (loading) {
    return (
      <div className="options">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  const configToUse = config || defaultConfig;

  return (
    <div className="options">
      {/* Header with primary metrics */}
      <div className="header">
        <div className="metric-card">
          <div className="metric-value">{configToUse.focusPage.habits.length}</div>
          <div className="metric-label">Habits</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{configToUse.distractionBlocker.domains.length}</div>
          <div className="metric-label">Blocked</div>
        </div>
        <div className="metric-card">
          <div className="metric-value">{configToUse.tabLimiter.maxTabs}</div>
          <div className="metric-label">Tab Limit</div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="quick-actions">
        <button 
          className={`action-btn primary ${activeSection === 'focus' ? 'active' : ''}`}
          onClick={() => setActiveSection('focus')}
        >
          Focus
        </button>
        <button 
          className={`action-btn secondary ${activeSection === 'blocker' ? 'active' : ''}`}
          onClick={() => setActiveSection('blocker')}
        >
          Blocker
        </button>
        <button 
          className={`action-btn secondary ${activeSection === 'care' ? 'active' : ''}`}
          onClick={() => setActiveSection('care')}
        >
          Care
        </button>
      </div>

      {/* Content based on active section */}
      <div className="content">
        {activeSection === 'focus' && (
          <div className="section-content">
            <div className="compact-form">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={configToUse.smartSearch.enabled}
                  onChange={(e) => updateConfig('smartSearch.enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                Save Thoughts
              </label>
            </div>

            <div className="habits-section">
              <h3>Habits ({configToUse.focusPage.habits.length}/5)</h3>
              <div className="habits-list">
                {configToUse.focusPage.habits.slice(0, 3).map((habit, index) => (
                  <div key={index} className="habit-item">
                    <input
                      type="text"
                      value={habit.name}
                      onChange={(e) => updateHabit(index, { name: e.target.value })}
                      placeholder="Habit name"
                      maxLength={20}
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
                      ×
                    </button>
                  </div>
                ))}
                {configToUse.focusPage.habits.length < 5 && (
                  <div className="add-habit">
                    <input
                      type="text"
                      placeholder="Add habit"
                      value={newHabitName}
                      onChange={(e) => setNewHabitName(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addHabit()}
                      maxLength={20}
                    />
                    <input
                      type="color"
                      value={newHabitColor}
                      onChange={(e) => setNewHabitColor(e.target.value)}
                    />
                    <button className="add-btn" onClick={addHabit}>+</button>
                  </div>
                )}
              </div>
            </div>

            <div className="pillars-section">
              <h3>Pillars ({configToUse.focusPage.pillars.length}/3)</h3>
              <div className="pillars-list">
                {configToUse.focusPage.pillars.slice(0, 2).map((pillar, index) => (
                  <div key={index} className="pillar-item">
                    <input
                      type="text"
                      value={pillar.quote}
                      onChange={(e) => updatePillar(index, { quote: e.target.value })}
                      placeholder="EXECUTE. NOW."
                      maxLength={15}
                    />
                    <input
                      type="color"
                      value={pillar.color}
                      onChange={(e) => updatePillar(index, { color: e.target.value })}
                    />
                    <button
                      className="remove-btn"
                      onClick={() => removePillar(index)}
                    >
                      ×
                    </button>
                  </div>
                ))}
                {configToUse.focusPage.pillars.length < 3 && (
                  <div className="add-pillar">
                    <input
                      type="text"
                      placeholder="Add pillar"
                      value={newPillarQuote}
                      onChange={(e) => setNewPillarQuote(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addPillar()}
                      maxLength={15}
                    />
                    <input
                      type="color"
                      value={newPillarColor}
                      onChange={(e) => setNewPillarColor(e.target.value)}
                    />
                    <button className="add-btn" onClick={addPillar}>+</button>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeSection === 'blocker' && (
          <div className="section-content">
            <div className="compact-form">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={configToUse.distractionBlocker.enabled}
                  onChange={(e) => updateConfig('distractionBlocker.enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                Distraction Blocker
              </label>
            </div>

            {configToUse.distractionBlocker.enabled && (
              <div className="domains-section">
                <h3>Domains ({configToUse.distractionBlocker.domains.length})</h3>
                <div className="domains-list">
                  {configToUse.distractionBlocker.domains.slice(0, 3).map((domain, index) => (
                    <div key={index} className="domain-item">
                      <div className="domain-info">
                        <div className="domain-name">{domain.domain}</div>
                        <div className="domain-limit">{domain.dailyLimit}/day</div>
                      </div>
                      <button
                        className="remove-btn"
                        onClick={() => removeDomain(index)}
                      >
                        ×
                      </button>
                    </div>
                  ))}
                  <div className="add-domain">
                    <input
                      type="text"
                      placeholder="facebook.com"
                      value={newDomain}
                      onChange={(e) => setNewDomain(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && addDomain()}
                      maxLength={20}
                    />
                    <input
                      type="number"
                      placeholder="3"
                      value={newDomainLimit}
                      onChange={(e) => setNewDomainLimit(parseInt(e.target.value) || 0)}
                      min="1"
                      max="10"
                    />
                    <button className="add-btn" onClick={addDomain}>+</button>
                  </div>
                </div>
              </div>
            )}

            <div className="compact-form">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={(configToUse.tabLimiter.maxTabs || 0) > 0}
                  onChange={(e) => updateConfig('tabLimiter.maxTabs', e.target.checked ? 3 : 0)}
                />
                <span className="toggle-slider"></span>
                Tab Limiter
              </label>
            </div>

            {(configToUse.tabLimiter.maxTabs || 0) > 0 && (
              <div className="tab-limit-section">
                <input
                  type="number"
                  value={configToUse.tabLimiter.maxTabs || 3}
                  onChange={(e) => updateConfig('tabLimiter.maxTabs', parseInt(e.target.value))}
                  min="1"
                  max="10"
                  className="tab-limit-input"
                />
                <span className="tab-limit-label">max tabs</span>
              </div>
            )}
          </div>
        )}

        {activeSection === 'care' && (
          <div className="section-content">
            <div className="compact-form">
              <label className="toggle-label">
                <input
                  type="checkbox"
                  checked={configToUse.eyeCare.enabled}
                  onChange={(e) => updateConfig('eyeCare.enabled', e.target.checked)}
                />
                <span className="toggle-slider"></span>
                20-20-20 Reminder
              </label>
            </div>

            {configToUse.eyeCare.enabled && (
              <div className="volume-section">
                <div className="volume-display">
                  {Math.round(configToUse.eyeCare.soundVolume * 100)}%
                </div>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={configToUse.eyeCare.soundVolume}
                  onChange={(e) => updateConfig('eyeCare.soundVolume', parseFloat(e.target.value))}
                  className="volume-slider"
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* Status indicators */}
      <div className="status-indicators">
        <div className={`status-dot ${configToUse.smartSearch.enabled ? 'active' : ''}`} title="Smart Search"></div>
        <div className={`status-dot ${configToUse.distractionBlocker.enabled ? 'active' : ''}`} title="Distraction Blocker"></div>
        <div className={`status-dot ${configToUse.eyeCare.enabled ? 'active' : ''}`} title="Eye Care"></div>
        <div className={`status-dot ${(configToUse.tabLimiter.maxTabs || 0) > 0 ? 'active' : ''}`} title="Tab Limiter"></div>
        {saveStatus === 'saving' && <div className="status-dot saving"></div>}
        {saveStatus === 'saved' && <div className="status-dot saved"></div>}
        {saveStatus === 'error' && <div className="status-dot error"></div>}
      </div>
    </div>
  );
};

// Render the options page
const root = document.getElementById('root');
if (root) {
  ReactDOM.render(<Options />, root);
} 