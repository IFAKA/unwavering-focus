import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { ExtensionConfig, Pillar } from './types';
import './focus-page.scss';

import { DEFAULT_CONFIG } from './types';

// Use centralized default config
const defaultConfig = DEFAULT_CONFIG;

interface FocusPageProps {}

const FocusPage: React.FC<FocusPageProps> = () => {
  const [config, setConfig] = useState<ExtensionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Mindfulness states
  const [mindfulMoment, setMindfulMoment] = useState(false);
  const [dopamineTriggers, setDopamineTriggers] = useState<string[]>([]);
  const [currentTrigger, setCurrentTrigger] = useState<string>('');
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [mindfulMinutes, setMindfulMinutes] = useState(0);
  const [phaseCountdown, setPhaseCountdown] = useState(4);
  const [breathingInterval, setBreathingInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [countdownInterval, setCountdownInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [sessionTimer, setSessionTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  const [mindfulQuote, setMindfulQuote] = useState<string>('');
  
  // Form visibility states
  const [showTriggerForm, setShowTriggerForm] = useState(false);
  const [showReminderForm, setShowReminderForm] = useState(false);
  
  // Editing states for pillars
  const [newPillarQuote, setNewPillarQuote] = useState('');
  const [newPillarDescription, setNewPillarDescription] = useState('');

  useEffect(() => {
    loadData();
    loadMindfulQuote();
    
    // Cleanup on unmount
    return () => {
      if (breathingInterval) clearInterval(breathingInterval);
      if (countdownInterval) clearInterval(countdownInterval);
      if (sessionTimer) clearInterval(sessionTimer);
    };
  }, []);

  const loadData = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
      
      setConfig(defaultConfig);
      
      if (response && typeof response === 'object') {
        setConfig(response.config || defaultConfig);
        // Load dopamine triggers from config
        setDopamineTriggers(response.config?.focusPage?.dopamineTriggers || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setConfig(defaultConfig);
    } finally {
      setLoading(false);
    }
  };

  const loadMindfulQuote = () => {
    const quotes = [
      "Breathe in peace, breathe out tension.",
      "This moment is your anchor.",
      "You are not your thoughts.",
      "Mindfulness is the key to presence.",
      "Every breath is a fresh start.",
      "Find stillness in the chaos.",
      "You have the power to choose your response.",
      "Be here now, fully present."
    ];
    setMindfulQuote(quotes[Math.floor(Math.random() * quotes.length)]);
  };

  const startBreathingExercise = () => {
    const phases = ['inhale', 'hold', 'exhale', 'hold'] as const;
    let phaseIndex = 0;
    let countdown = 4;
    
    // Set initial countdown
    setPhaseCountdown(countdown);
    setBreathingPhase(phases[phaseIndex]);
    
    const interval = setInterval(() => {
      phaseIndex = (phaseIndex + 1) % phases.length;
      setBreathingPhase(phases[phaseIndex]);
      setBreathingCount(prev => prev + 1);
      
      // Reset countdown for next phase
      countdown = 4;
      setPhaseCountdown(countdown);
    }, 4000); // 4 seconds per phase (box breathing: 4-4-4-4)

    setBreathingInterval(interval);

    // Countdown timer for visual feedback - updates every 100ms for smooth animation
    const countdownInt = setInterval(() => {
      setPhaseCountdown(prev => {
        if (prev <= 0.1) {
          return 4; // Reset to 4 for next phase
        }
        return prev - 0.1; // Decrease by 0.1 every 100ms for smooth countdown
      });
    }, 100); // Update every 100ms for smooth animation

    setCountdownInterval(countdownInt);
  };

  const stopBreathingExercise = () => {
    if (breathingInterval) {
      clearInterval(breathingInterval);
      setBreathingInterval(null);
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setBreathingPhase('inhale');
    setBreathingCount(0);
    setPhaseCountdown(4);
  };

  const startMindfulMoment = () => {
    setMindfulMoment(true);
    setMindfulMinutes(0);
    startBreathingExercise();
    
    const timer = setInterval(() => {
      setMindfulMinutes(prev => prev + 1);
    }, 60000); // 1 minute intervals

    setSessionTimer(timer);
  };

  const endMindfulSession = () => {
    setMindfulMoment(false);
    stopBreathingExercise();
    if (sessionTimer) {
      clearInterval(sessionTimer);
      setSessionTimer(null);
    }
  };

  const saveConfig = async (configToSave: ExtensionConfig) => {
    try {
      const response = await chrome.runtime.sendMessage({ 
        type: 'UPDATE_CONFIG', 
        config: configToSave 
      });
      if (!response || !response.success) {
        console.error('Error saving config:', response);
      }
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const addPillar = async () => {
    if (!config || !newPillarQuote.trim()) return;
    
    const pillarQuote = newPillarQuote.trim();
    const existingPillar = config.focusPage.pillars.find(
      p => p.quote.toLowerCase() === pillarQuote.toLowerCase()
    );
    
    if (existingPillar) return;

    const newPillar: Pillar = {
      id: Date.now().toString(),
      quote: pillarQuote,
      description: newPillarDescription.trim() || "",
      color: '#007aff' // Default color
    };
    
    const updatedConfig = {
      ...config,
      focusPage: {
        ...config.focusPage,
        pillars: [newPillar, ...config.focusPage.pillars]
      }
    };
    
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
    setNewPillarQuote('');
    setNewPillarDescription('');
    setShowReminderForm(false);
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

  const addDopamineTrigger = async () => {
    if (!config || !currentTrigger.trim()) return;
    
    const trigger = currentTrigger.trim();
    if (dopamineTriggers.includes(trigger)) return;
    
    const newTriggers = [...dopamineTriggers, trigger];
    setDopamineTriggers(newTriggers);
    
    const updatedConfig = {
      ...config,
      focusPage: {
        ...config.focusPage,
        dopamineTriggers: newTriggers
      }
    };
    
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
    setCurrentTrigger('');
    setShowTriggerForm(false);
  };

  const removeDopamineTrigger = async (index: number) => {
    if (!config) return;
    
    const newTriggers = dopamineTriggers.filter((_, i) => i !== index);
    setDopamineTriggers(newTriggers);
    
    const updatedConfig = {
      ...config,
      focusPage: {
        ...config.focusPage,
        dopamineTriggers: newTriggers
      }
    };
    
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
  };

  const getProgressPercentage = () => {
    return ((4 - phaseCountdown) / 4) * 100;
  };

  const getProgressColor = () => {
    switch (breathingPhase) {
      case 'inhale':
        return '#34c759'; // Green for inhale
      case 'exhale':
        return '#ff3b30'; // Red for exhale
      case 'hold':
        return '#007aff'; // Blue for hold
      default:
        return '#007aff';
    }
  };

  const getCountUp = () => {
    return (4 - phaseCountdown).toFixed(1);
  };

  if (loading) {
    return (
      <div className="focus-container">
        <div className="loading-state">
          <div className="loading-icon">⏳</div>
          <div className="loading-text">Loading...</div>
        </div>
      </div>
    );
  }

  const pillars = config?.focusPage?.pillars || [];

  return (
    <div className="focus-container">
      {/* Header - Mindfulness Metrics */}
      <div className="header-section">
        <div className="header-top">
          <div className="metrics-row">
            <div className="metric-card">
              <div className="metric-icon">🧘</div>
              <div className="metric-value">{mindfulMinutes}</div>
              <div className="metric-label">Mindful</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">💨</div>
              <div className="metric-value">{breathingCount}</div>
              <div className="metric-label">Breaths</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">⚡</div>
              <div className="metric-value">{pillars.length}</div>
              <div className="metric-label">Reminders</div>
            </div>
            <div className="metric-card">
              <div className="metric-icon">🎯</div>
              <div className="metric-value">{dopamineTriggers.length}</div>
              <div className="metric-label">Triggers</div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content - 4 Column Layout */}
      <div className="main-content">
        {/* Column 1 - Box Breathing */}
        <div className="content-column">
          <div className="section-header">
            <span className="section-title">Box Breathing</span>
            <span className="section-subtitle">4-4-4-4 rhythm</span>
          </div>
          
          <div className="breathing-exercise">
            <div className="breathing-progress">
              <div className="breathing-phase" style={{ color: getProgressColor() }}>{breathingPhase.toUpperCase()}</div>
              <div className="progress-bar">
                <div className="progress-fill" style={{ 
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: getProgressColor()
                }}></div>
              </div>
              <div className="breathing-count">{getCountUp()}s</div>
            </div>
            
            <div className="mindful-actions">
              {!mindfulMoment ? (
                <button 
                  className="action-btn primary"
                  onClick={startMindfulMoment}
                >
                  🧘 Start Breathing
                </button>
              ) : (
                <div className="mindful-session">
                  <div className="session-timer">{mindfulMinutes}m</div>
                  <button 
                    className="action-btn secondary"
                    onClick={endMindfulSession}
                  >
                    Stop
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Column 2 - Dopamine Triggers */}
        <div className="content-column">
          <div className="section-header">
            <span className="section-title">Dopamine Triggers</span>
            <span className="section-subtitle">Recognize your patterns</span>
          </div>
          
          <div className="triggers-section">
            {!showTriggerForm ? (
              <button 
                className="add-trigger-btn"
                onClick={() => setShowTriggerForm(true)}
              >
                + Add Trigger
              </button>
            ) : (
              <div className="add-trigger">
                <input
                  type="text"
                  placeholder="What triggers your dopamine seeking?"
                  value={currentTrigger}
                  onChange={(e) => setCurrentTrigger(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addDopamineTrigger()}
                  className="trigger-input"
                  autoFocus
                />
                <div className="form-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setShowTriggerForm(false);
                      setCurrentTrigger('');
                    }}
                  >
                    Cancel
                  </button>
                  <button 
                    className="add-btn"
                    onClick={addDopamineTrigger}
                    title="Add trigger"
                  >
                    +
                  </button>
                </div>
              </div>
            )}
            
            {dopamineTriggers.length > 0 ? (
              <div className="triggers-list">
                {dopamineTriggers.map((trigger, index) => (
                  <div key={index} className="trigger-item">
                    <span className="trigger-text">{trigger}</span>
                    <button
                      className="remove-btn"
                      onClick={() => removeDopamineTrigger(index)}
                      title="Remove trigger"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">🎯</div>
                <div className="empty-title">No Triggers</div>
                <div className="empty-message">Add what triggers your dopamine seeking to build awareness</div>
              </div>
            )}
          </div>
        </div>

        {/* Column 3 - Mindful Reminders */}
        <div className="content-column">
          <div className="section-header">
            <span className="section-title">Mindful Reminders</span>
            <span className="section-subtitle">Your core principles</span>
          </div>
          
          <div className="reminders-section">
            {!showReminderForm ? (
              <button 
                className="add-reminder-btn"
                onClick={() => setShowReminderForm(true)}
              >
                + Add Reminder
              </button>
            ) : (
              <div className="add-reminder">
                <input
                  type="text"
                  placeholder="Add mindful reminder"
                  value={newPillarQuote}
                  onChange={(e) => setNewPillarQuote(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addPillar()}
                  maxLength={50}
                  className="reminder-input"
                  autoFocus
                />
                <input
                  type="text"
                  placeholder="Why this matters"
                  value={newPillarDescription}
                  onChange={(e) => setNewPillarDescription(e.target.value)}
                  maxLength={100}
                  className="reminder-input"
                />
                <div className="form-actions">
                  <button 
                    className="cancel-btn"
                    onClick={() => {
                      setShowReminderForm(false);
                      setNewPillarQuote('');
                      setNewPillarDescription('');
                    }}
                  >
                    Cancel
                  </button>
                  <button className="add-btn" onClick={addPillar}>+</button>
                </div>
              </div>
            )}
            
            {pillars.length > 0 ? (
              <div className="reminders-list">
                {pillars.map((pillar, index) => (
                  <div key={pillar.id} className="reminder-item">
                    <div className="reminder-content">
                      <div className="reminder-quote">{pillar.quote}</div>
                      {pillar.description && pillar.description !== "Your mindful reminder" && (
                        <div className="reminder-description">{pillar.description}</div>
                      )}
                    </div>
                    <div className="reminder-actions">
                      <button
                        className="remove-btn"
                        onClick={() => removePillar(index)}
                        title="Remove reminder"
                      >
                        ×
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <div className="empty-icon">⚡</div>
                <div className="empty-title">No Reminders</div>
                <div className="empty-message">Add reminders that guide you back to what matters</div>
              </div>
            )}
          </div>
        </div>

        {/* Column 4 - Quick Actions */}
        <div className="content-column">
          <div className="section-header">
            <span className="section-title">Quick Actions</span>
            <span className="section-subtitle">Stay focused</span>
          </div>
          
          <div className="quick-actions-section">
            <button 
              className="quick-action-btn primary"
              onClick={() => chrome.tabs.create({ url: 'https://www.google.com' })}
              title="Return to work"
            >
              🚀 Return to Work
            </button>
            
            <button 
              className="quick-action-btn secondary"
              onClick={() => window.history.back()}
              title="Go back"
            >
              ← Back
            </button>
            
            <div className="status-indicators-inline">
              <div className={`status-dot ${mindfulMoment ? 'active' : 'inactive'}`} title="Mindful Session Active">
                🧘
              </div>
              <div className={`status-dot ${dopamineTriggers.length > 0 ? 'active' : 'inactive'}`} title="Triggers Recognized">
                🎯
              </div>
              <div className={`status-dot ${pillars.length > 0 ? 'active' : 'inactive'}`} title="Reminders Set">
                ⚡
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Render the focus page
const root = document.getElementById('root');
if (root) {
  import('react-dom/client').then(({ createRoot }) => {
    createRoot(root).render(
      <ErrorBoundary>
        <FocusPage />
      </ErrorBoundary>
    );
  });
} 