import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { ExtensionConfig, Habit, Pillar } from './types';
import AppleWatchIcon from './components/ui/AppleWatchIcon';
import './styles.css';

const FocusPage: React.FC = () => {
  const [config, setConfig] = useState<ExtensionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'focus' | 'habits' | 'pillars'>('focus');
  
  // Focus session states
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionTimer, setSessionTimer] = useState<NodeJS.Timeout | null>(null);
  
  // Breathing exercise states
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [phaseCountdown, setPhaseCountdown] = useState(4);
  const [breathingInterval, setBreathingInterval] = useState<NodeJS.Timeout | null>(null);
  const [countdownInterval, setCountdownInterval] = useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadData();
    
    return () => {
      if (sessionTimer) clearInterval(sessionTimer);
      if (breathingInterval) clearInterval(breathingInterval);
      if (countdownInterval) clearInterval(countdownInterval);
    };
  }, []);

  const loadData = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
      setConfig(response?.config || null);
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const startFocusSession = () => {
    setIsSessionActive(true);
    setSessionDuration(0);
    
    const timer = setInterval(() => {
      setSessionDuration(prev => prev + 1);
    }, 1000);
    
    setSessionTimer(timer);
  };

  const stopFocusSession = () => {
    setIsSessionActive(false);
    if (sessionTimer) {
      clearInterval(sessionTimer);
      setSessionTimer(null);
    }
  };

  const startBreathingExercise = () => {
    setIsBreathingActive(true);
    setBreathingPhase('inhale');
    setPhaseCountdown(4);
    
    const interval = setInterval(() => {
      setBreathingPhase(prev => {
        if (prev === 'inhale') return 'hold';
        if (prev === 'hold') return 'exhale';
        if (prev === 'exhale') return 'hold';
        return 'inhale';
      });
      setBreathingCount(prev => prev + 1);
      setPhaseCountdown(4);
    }, 4000);
    
    const countdownTimer = setInterval(() => {
      setPhaseCountdown(prev => {
        if (prev <= 1) return 4;
        return prev - 1;
      });
    }, 1000);
    
    setBreathingInterval(interval);
    setCountdownInterval(countdownTimer);
  };

  const stopBreathingExercise = () => {
    setIsBreathingActive(false);
    if (breathingInterval) {
      clearInterval(breathingInterval);
      setBreathingInterval(null);
    }
    if (countdownInterval) {
      clearInterval(countdownInterval);
      setCountdownInterval(null);
    }
    setBreathingPhase('inhale');
    setPhaseCountdown(4);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getBreathingPhaseColor = () => {
    switch (breathingPhase) {
      case 'inhale': return 'text-accent-primary';
      case 'exhale': return 'text-success-color';
      default: return 'text-warning-color';
    }
  };

  const getBreathingPhaseIcon = () => {
    switch (breathingPhase) {
      case 'inhale': return 'arrow-up';
      case 'exhale': return 'arrow-down';
      default: return 'pause';
    }
  };

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center h-screen bg-bg-primary text-text-primary">
        <div className="animate-spin mb-md">
          <AppleWatchIcon name="loading" size="xl" />
        </div>
        <div className="text-md text-text-secondary">Loading focus tools...</div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-screen bg-bg-primary text-text-primary font-apple">
      {/* Header */}
      <div className="p-lg bg-bg-secondary border-b border-bg-tertiary">
        <div className="flex items-center justify-between">
          <h1 className="text-xl font-semibold text-text-primary">Focus Center</h1>
          <div className="flex gap-sm">
            <button
              className={`px-md py-sm rounded-apple text-sm font-medium transition-all duration-200 ${
                activeTab === 'focus' 
                  ? 'bg-accent-primary text-white' 
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
              }`}
              onClick={() => setActiveTab('focus')}
            >
              Focus
            </button>
            <button
              className={`px-md py-sm rounded-apple text-sm font-medium transition-all duration-200 ${
                activeTab === 'habits' 
                  ? 'bg-accent-primary text-white' 
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
              }`}
              onClick={() => setActiveTab('habits')}
            >
              Habits
            </button>
            <button
              className={`px-md py-sm rounded-apple text-sm font-medium transition-all duration-200 ${
                activeTab === 'pillars' 
                  ? 'bg-accent-primary text-white' 
                  : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
              }`}
              onClick={() => setActiveTab('pillars')}
            >
              Pillars
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-lg">
        {activeTab === 'focus' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {/* Focus Session */}
            <div className="bg-bg-secondary rounded-apple p-lg border border-bg-tertiary">
              <div className="flex items-center justify-between mb-md">
                <h2 className="text-lg font-semibold text-text-primary">Focus Session</h2>
                <AppleWatchIcon name="focus" size="md" />
              </div>
              
              <div className="text-center mb-lg">
                <div className="text-4xl font-bold text-text-primary mb-sm">
                  {formatTime(sessionDuration)}
                </div>
                <div className="text-sm text-text-secondary">
                  {isSessionActive ? 'Session in progress' : 'Ready to focus'}
                </div>
              </div>
              
              <div className="flex gap-sm">
                {!isSessionActive ? (
                  <button
                    className="flex-1 py-md rounded-apple bg-accent-primary text-white font-medium transition-all duration-200 hover:bg-accent-secondary hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                    onClick={startFocusSession}
                  >
                    Start Session
                  </button>
                ) : (
                  <button
                    className="flex-1 py-md rounded-apple bg-danger-color text-white font-medium transition-all duration-200 hover:bg-[#dc2626] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                    onClick={stopFocusSession}
                  >
                    End Session
                  </button>
                )}
              </div>
            </div>

            {/* Breathing Exercise */}
            <div className="bg-bg-secondary rounded-apple p-lg border border-bg-tertiary">
              <div className="flex items-center justify-between mb-md">
                <h2 className="text-lg font-semibold text-text-primary">Box Breathing</h2>
                <div className="text-sm text-text-secondary bg-bg-tertiary px-sm py-xs rounded-apple">
                  4-4-4-4
                </div>
              </div>
              
              <div className="text-center mb-lg">
                <div className={`text-6xl font-bold mb-md transition-colors duration-300 ${getBreathingPhaseColor()}`}>
                  <AppleWatchIcon name={getBreathingPhaseIcon()} size="xl" />
                </div>
                <div className={`text-2xl font-bold mb-sm ${getBreathingPhaseColor()}`}>
                  {breathingPhase.toUpperCase()}
                </div>
                <div className="text-sm text-text-secondary">
                  {phaseCountdown}s remaining
                </div>
                <div className="text-md text-text-primary mt-sm">
                  Breaths: {Math.floor(breathingCount / 4)}
                </div>
              </div>
              
              <div className="flex gap-sm">
                {!isBreathingActive ? (
                  <button
                    className="flex-1 py-md rounded-apple bg-accent-primary text-white font-medium transition-all duration-200 hover:bg-accent-secondary hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                    onClick={startBreathingExercise}
                  >
                    Start Breathing
                  </button>
                ) : (
                  <button
                    className="flex-1 py-md rounded-apple bg-danger-color text-white font-medium transition-all duration-200 hover:bg-[#dc2626] hover:-translate-y-[1px] hover:shadow-[0_4px_12px_rgba(0,0,0,0.3)]"
                    onClick={stopBreathingExercise}
                  >
                    Stop Breathing
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'habits' && (
          <div className="space-y-lg">
            <div className="bg-bg-secondary rounded-apple p-lg border border-bg-tertiary">
              <div className="flex items-center justify-between mb-md">
                <h2 className="text-lg font-semibold text-text-primary">Daily Habits</h2>
                <AppleWatchIcon name="chart" size="md" />
              </div>
              
              {config?.focusPage?.habits && config.focusPage.habits.length > 0 ? (
                <div className="space-y-sm">
                  {config.focusPage.habits.map((habit: Habit, index: number) => (
                    <div
                      key={habit.id}
                      className="flex items-center gap-md p-md bg-bg-tertiary rounded-apple border border-bg-secondary"
                      style={{ borderLeftColor: habit.color, borderLeftWidth: '4px' }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <div className="flex-1">
                        <div className="text-md font-medium text-text-primary">{habit.name}</div>
                      </div>
                      <div className="flex gap-xs">
                        <button className="w-8 h-8 rounded-full bg-success-color text-white text-sm font-bold flex items-center justify-center hover:bg-[#059669] transition-colors">
                          ✓
                        </button>
                        <button className="w-8 h-8 rounded-full bg-warning-color text-white text-sm font-bold flex items-center justify-center hover:bg-[#e6850e] transition-colors">
                          ~
                        </button>
                        <button className="w-8 h-8 rounded-full bg-danger-color text-white text-sm font-bold flex items-center justify-center hover:bg-[#dc2626] transition-colors">
                          ✗
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-xl">
                  <AppleWatchIcon name="chart" size="xl" className="text-text-secondary mb-md" />
                  <div className="text-md font-medium text-text-primary mb-xs">No Habits Yet</div>
                  <div className="text-sm text-text-secondary">Add habits in the extension settings</div>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'pillars' && (
          <div className="space-y-lg">
            <div className="bg-bg-secondary rounded-apple p-lg border border-bg-tertiary">
              <div className="flex items-center justify-between mb-md">
                <h2 className="text-lg font-semibold text-text-primary">Core Pillars</h2>
                <AppleWatchIcon name="building" size="md" />
              </div>
              
              {config?.focusPage?.pillars && config.focusPage.pillars.length > 0 ? (
                <div className="space-y-md">
                  {config.focusPage.pillars.map((pillar: Pillar, index: number) => (
                    <div
                      key={pillar.id}
                      className="p-md bg-bg-tertiary rounded-apple border border-bg-secondary"
                      style={{ borderLeftColor: pillar.color, borderLeftWidth: '4px' }}
                    >
                      <div
                        className="w-4 h-4 rounded-full mb-sm"
                        style={{ backgroundColor: pillar.color }}
                      />
                      <div className="text-lg font-semibold text-text-primary mb-xs">
                        "{pillar.quote}"
                      </div>
                      <div className="text-sm text-text-secondary leading-relaxed">
                        {pillar.description}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-xl">
                  <AppleWatchIcon name="building" size="xl" className="text-text-secondary mb-md" />
                  <div className="text-md font-medium text-text-primary mb-xs">No Pillars Yet</div>
                  <div className="text-sm text-text-secondary">Add core principles in the extension settings</div>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Quick Actions Footer */}
      <div className="p-lg bg-bg-secondary border-t border-bg-tertiary">
        <div className="flex gap-sm">
          <button className="flex-1 py-md rounded-apple bg-bg-tertiary text-text-primary font-medium transition-all duration-200 hover:bg-bg-secondary hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-center gap-sm">
            <AppleWatchIcon name="settings" size="sm" />
            Settings
          </button>
          <button className="flex-1 py-md rounded-apple bg-accent-primary text-white font-medium transition-all duration-200 hover:bg-accent-secondary hover:-translate-y-[1px] hover:shadow-[0_2px_8px_rgba(0,0,0,0.3)] flex items-center justify-center gap-sm">
            <AppleWatchIcon name="focus" size="sm" />
            Focus Mode
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