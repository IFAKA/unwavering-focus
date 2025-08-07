import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { ExtensionConfig, Pillar } from './types';
import './styles.css';

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
    
    // Start countdown timer
    const countdownTimer = setInterval(() => {
      setPhaseCountdown(prev => {
        if (prev <= 1) {
          return 4; // Reset to 4 for next phase
        }
        return prev - 1;
      });
    }, 1000);
    
    setCountdownInterval(countdownTimer);
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
    // Don't reset the breath count - keep it for display
    setPhaseCountdown(4);
  };

  const startMindfulMoment = () => {
    setMindfulMoment(true);
    setMindfulMinutes(0);
    
    const timer = setInterval(() => {
      setMindfulMinutes(prev => prev + 1);
    }, 60000); // 1 minute intervals
    
    setSessionTimer(timer);
  };

  const endMindfulSession = () => {
    setMindfulMoment(false);
    if (sessionTimer) {
      clearInterval(sessionTimer);
      setSessionTimer(null);
    }
  };

  const resetBreathingCount = () => {
    setBreathingCount(0);
  };

  const saveConfig = async (configToSave: ExtensionConfig) => {
    try {
      await chrome.runtime.sendMessage({
        type: 'UPDATE_CONFIG',
        config: configToSave
      });
    } catch (error) {
      console.error('Error saving config:', error);
    }
  };

  const addPillar = async () => {
    if (!newPillarQuote.trim() || !newPillarDescription.trim()) return;
    
    if (!config) return;
    
    const newPillar: Pillar = {
      id: Date.now().toString(),
      quote: newPillarQuote.trim(),
      description: newPillarDescription.trim(),
      color: '#007aff'
    };
    
    const updatedConfig = {
      ...config,
      focusPage: {
        ...config.focusPage,
        pillars: [...(config.focusPage?.pillars || []), newPillar]
      }
    };
    
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
    
    // Reset form
    setNewPillarQuote('');
    setNewPillarDescription('');
  };

  const updatePillar = async (index: number, updates: Partial<Pillar>) => {
    if (!config?.focusPage?.pillars) return;
    
    const updatedItems = [...config.focusPage.pillars];
    updatedItems[index] = { ...updatedItems[index], ...updates };
    
    const updatedConfig = {
      ...config,
      focusPage: {
        ...config.focusPage,
        pillars: updatedItems
      }
    };
    
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
  };

  const removePillar = async (index: number) => {
    if (!config?.focusPage?.pillars) return;
    
    const updatedItems = config.focusPage.pillars.filter((_, i) => i !== index);
    
    const updatedConfig = {
      ...config,
      focusPage: {
        ...config.focusPage,
        pillars: updatedItems
      }
    };
    
    setConfig(updatedConfig);
    await saveConfig(updatedConfig);
  };

  const addDopamineTrigger = async () => {
    if (!currentTrigger.trim()) return;
    
    const newTriggers = [...dopamineTriggers, currentTrigger.trim()];
    setDopamineTriggers(newTriggers);
    setCurrentTrigger('');
    
    if (!config) return;
    
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

  const removeDopamineTrigger = async (index: number) => {
    const newTriggers = dopamineTriggers.filter((_, i) => i !== index);
    setDopamineTriggers(newTriggers);
    
    if (!config) return;
    
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
    return Math.min((breathingCount / 10) * 100, 100);
  };

  const getProgressColor = () => {
    const percentage = getProgressPercentage();
    if (percentage < 30) return 'bg-danger-color';
    if (percentage < 70) return 'bg-warning-color';
    return 'bg-success-color';
  };

  const getCountUp = () => {
    return Math.floor(breathingCount / 4); // 4 phases per breath cycle
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen gap-md">
        <div className="text-3xl animate-spin">⏳</div>
        <div className="text-md text-text-secondary">Loading...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg-primary text-text-primary font-apple">
      {/* Header Section - Metrics Row */}
      <div className="p-lg bg-bg-secondary border-b border-bg-tertiary">
        <div className="flex gap-sm">
          <div className="flex-1 flex flex-col items-center text-center p-sm bg-bg-tertiary rounded-apple border border-border-color">
            <div className="text-md mb-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-text-primary mb-xs">20:00</div>
            <div className="text-xs text-text-secondary uppercase tracking-[0.5px]">Eye Care</div>
          </div>
          <div className="flex-1 flex flex-col items-center text-center p-sm bg-bg-tertiary rounded-apple border border-border-color">
            <div className="text-md mb-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-text-primary mb-xs">3/5</div>
            <div className="text-xs text-text-secondary uppercase tracking-[0.5px]">Tabs</div>
          </div>
          <div className="flex-1 flex flex-col items-center text-center p-sm bg-bg-tertiary rounded-apple border border-border-color">
            <div className="text-md mb-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-text-primary mb-xs">5/7</div>
            <div className="text-xs text-text-secondary uppercase tracking-[0.5px]">Habits</div>
          </div>
          <div className="flex-1 flex flex-col items-center text-center p-sm bg-bg-tertiary rounded-apple border border-border-color">
            <div className="text-md mb-xs">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
              </svg>
            </div>
            <div className="text-lg font-semibold text-text-primary mb-xs">3</div>
            <div className="text-xs text-text-secondary uppercase tracking-[0.5px]">Pillars</div>
          </div>
        </div>
      </div>

      {/* Main Content - 4 Column Layout */}
      <div className="grid grid-cols-4 gap-md p-lg overflow-hidden flex-1">
        {/* Column 1: Breathing Exercise */}
        <div className="flex flex-col gap-md overflow-hidden">
          <div className="flex items-center justify-between gap-sm mb-sm">
            <div className="text-lg font-semibold text-text-primary">Breathing</div>
            <div className="text-sm text-text-secondary bg-bg-tertiary px-2 py-1 rounded-[10px] font-medium">4-4-4-4</div>
          </div>
          
          <div className="bg-bg-tertiary rounded-apple p-lg border border-border-color text-center mb-md">
            <div className="mb-md">
              <h3 className="text-lg font-semibold text-text-primary mb-xs">Box Breathing</h3>
              <p className="text-sm text-text-secondary m-0">Follow the rhythm to center yourself</p>
            </div>
            
            <div className="mb-lg">
              <div className={`text-lg font-semibold mb-md uppercase tracking-[1px] transition-colors duration-300 ${
                breathingPhase === 'inhale' ? 'text-accent-primary' : 
                breathingPhase === 'exhale' ? 'text-success-color' : 'text-warning-color'
              }`}>
                {breathingPhase.toUpperCase()}
              </div>
              
              <div className="w-full h-2 bg-bg-secondary rounded mb-sm overflow-hidden border border-border-color">
                <div 
                  className={`h-full rounded transition-all duration-100 ${getProgressColor()}`}
                  style={{ width: `${getProgressPercentage()}%` }}
                ></div>
              </div>
              
                          <div className="text-sm font-medium text-text-secondary">
              {phaseCountdown}s remaining
            </div>
            
            <div className="text-sm text-text-primary mt-sm">
              Breaths: {getCountUp()}
            </div>
          </div>
          
          <div className="text-sm text-text-primary italic mt-sm p-sm bg-bg-secondary rounded border-l-4 border-accent-primary leading-relaxed">
            {mindfulQuote}
          </div>
          
          <div className="flex gap-sm mt-sm">
            {!breathingInterval ? (
              <button 
                className="flex-1 px-sm py-sm rounded border border-accent-primary bg-accent-primary text-white text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-accent-secondary"
                onClick={startBreathingExercise}
              >
                Start Breathing
              </button>
            ) : (
              <button 
                className="flex-1 px-sm py-sm rounded border border-danger-color bg-danger-color text-white text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-[#dc2626]"
                onClick={stopBreathingExercise}
              >
                Stop Breathing
              </button>
            )}
            <button 
              className="flex-1 px-sm py-sm rounded border border-border-color bg-bg-secondary text-text-secondary text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary"
              onClick={resetBreathingCount}
            >
              Reset Counter
            </button>
          </div>
          </div>
          
          <div className="flex flex-col gap-sm">
            <button 
              className="w-full p-md rounded-apple border-2 border-dashed border-border-color bg-bg-secondary text-text-secondary text-md font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-sm mb-md"
              onClick={() => setShowTriggerForm(!showTriggerForm)}
            >
              <span>➕</span>
              <span>Add Trigger</span>
            </button>
            
            {showTriggerForm && (
              <div className="bg-bg-tertiary rounded-apple p-md border border-border-color mb-md">
                <div className="flex flex-col gap-sm mb-md">
                  <input
                    type="text"
                    value={currentTrigger}
                    onChange={(e) => setCurrentTrigger(e.target.value)}
                    placeholder="Enter dopamine trigger..."
                    className="flex-1 bg-bg-secondary border border-border-color rounded p-sm text-text-primary text-sm font-inherit focus:outline-none focus:border-accent-primary focus:shadow-[0_0_0_2px_rgba(0,122,255,0.2)]"
                  />
                  <div className="flex gap-sm">
                    <button 
                      className="px-sm py-sm rounded border border-border-color bg-bg-secondary text-text-secondary text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary"
                      onClick={() => setShowTriggerForm(false)}
                    >
                      Cancel
                    </button>
                    <button 
                      className="px-sm py-sm rounded border border-border-color bg-bg-secondary text-text-secondary text-sm font-medium cursor-pointer transition-all duration-200 hover:bg-bg-tertiary hover:text-text-primary"
                      onClick={addDopamineTrigger}
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Column 2: Dopamine Triggers */}
        <div className="flex flex-col gap-md overflow-hidden">
          <div className="flex items-center justify-between gap-sm mb-sm">
            <div className="text-lg font-semibold text-text-primary">Triggers</div>
            <div className="text-sm text-text-secondary">{dopamineTriggers.length}</div>
          </div>
          
          <div className="bg-bg-tertiary rounded-apple p-md border border-border-color flex flex-col flex-1">
            <div className="flex flex-col gap-sm flex-1 overflow-y-auto max-h-[300px]">
              {dopamineTriggers.map((trigger, index) => (
                <div key={index} className="flex items-center justify-between bg-bg-secondary rounded p-sm border border-border-color relative">
                  <div className="text-sm text-text-primary flex-1">{trigger}</div>
                  <button 
                    className="opacity-0 transition-opacity duration-200 hover:opacity-100 w-7 h-7 rounded-full border-2 border-danger-color bg-danger-color text-text-primary text-sm font-semibold flex items-center justify-center cursor-pointer transition-all duration-200 hover:scale-[1.1] hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)]"
                    onClick={() => removeDopamineTrigger(index)}
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Mindful Reminders */}
        <div className="flex flex-col gap-md overflow-hidden">
          <div className="flex items-center justify-between gap-sm mb-sm">
            <div className="text-lg font-semibold text-text-primary">Reminders</div>
            <div className="text-sm text-text-secondary">3</div>
          </div>
          
          <div className="bg-bg-tertiary rounded-apple p-md border border-border-color flex flex-col flex-1">
            <div className="flex flex-col gap-sm mb-md">
              <button 
                className="w-full p-md rounded-apple border-2 border-dashed border-border-color bg-bg-secondary text-text-secondary text-md font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-sm mb-md"
                onClick={() => setShowReminderForm(!showReminderForm)}
              >
                <span>➕</span>
                <span>Add Reminder</span>
              </button>
            </div>
            
            <div className="flex flex-col gap-sm flex-1 overflow-y-auto max-h-[300px]">
              <div className="flex items-start justify-between bg-bg-secondary rounded p-sm border border-border-color border-l-4 border-accent-primary relative">
                <div className="flex-1">
                  <div className="text-md font-medium text-text-primary mb-xs leading-relaxed">
                    "Be present in this moment"
                  </div>
                  <div className="text-sm text-text-secondary leading-relaxed">
                    Remember to stay focused on what matters most
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Column 4: Quick Actions */}
        <div className="flex flex-col gap-md overflow-hidden">
          <div className="flex items-center justify-between gap-sm mb-sm">
            <div className="text-lg font-semibold text-text-primary">Actions</div>
            <div className="text-sm text-text-secondary">Quick</div>
          </div>
          
          <div className="bg-bg-tertiary rounded-apple p-md border border-border-color flex flex-col gap-md flex-1">
            <button className="w-full p-md rounded-apple border-2 border-border-color bg-bg-secondary text-text-primary text-md font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-sm hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
              <span>🧘</span>
              <span>Start Session</span>
            </button>
            
            <button className="w-full p-md rounded-apple border-2 border-border-color bg-accent-primary border-accent-primary text-text-primary text-md font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-sm hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-accent-secondary hover:border-accent-secondary">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                </svg>
              <span>Focus Mode</span>
            </button>
            
            <button className="w-full p-md rounded-apple border-2 border-border-color bg-bg-secondary text-text-secondary text-md font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-sm hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-bg-tertiary hover:border-accent-primary hover:text-accent-primary">
              <span>📊</span>
              <span>Analytics</span>
            </button>
            
            <button className="w-full p-md rounded-apple border-2 border-border-color bg-bg-secondary text-text-secondary text-md font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-sm hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-bg-tertiary hover:border-accent-primary hover:text-accent-primary">
                              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              <span>Settings</span>
            </button>
          </div>
        </div>
      </div>

      {/* Actions Section */}
      <div className="p-lg bg-bg-secondary border-t border-bg-tertiary">
        <div className="flex gap-md">
          <button className="flex-1 p-md rounded-apple border-2 border-border-color bg-bg-tertiary text-text-primary text-md font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-sm hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]">
            <span>🔄</span>
            <span>Reset</span>
          </button>
          <button className="flex-1 p-md rounded-apple border-2 border-accent-primary bg-accent-primary text-text-primary text-md font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-sm hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:bg-accent-secondary hover:border-accent-secondary">
            <span>🚀</span>
            <span>Start</span>
          </button>
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