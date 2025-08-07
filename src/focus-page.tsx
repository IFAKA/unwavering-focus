import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { ExtensionConfig, Habit, Pillar } from './types';
import AppleWatchIcon from './components/ui/AppleWatchIcon';
import './styles.css';

const FocusPage: React.FC = () => {
  const [config, setConfig] = useState<ExtensionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'focus' | 'habits' | 'pillars' | 'metrics'>('focus');
  
  // Focus session states
  const [isSessionActive, setIsSessionActive] = useState(false);
  const [sessionDuration, setSessionDuration] = useState(0);
  const [sessionTimer, setSessionTimer] = useState<ReturnType<typeof setInterval> | null>(null);
  
  // Breathing exercise states
  const [isBreathingActive, setIsBreathingActive] = useState(false);
  const [breathingPhase, setBreathingPhase] = useState<'inhale' | 'hold' | 'exhale'>('inhale');
  const [breathingCount, setBreathingCount] = useState(0);
  const [phaseCountdown, setPhaseCountdown] = useState(4);
  const [breathingInterval, setBreathingInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  const [countdownInterval, setCountdownInterval] = useState<ReturnType<typeof setInterval> | null>(null);
  
  // Metrics data
  const [storageData, setStorageData] = useState<any>(null);

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
      setStorageData(response || null);
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
      <div className="ds-flex-center flex-col h-screen ds-container">
        <div className="mb-md">
          <AppleWatchIcon name="loading" size="xl" />
        </div>
        <div className="text-md ds-text-secondary">Loading focus tools...</div>
      </div>
    );
  }

  return (
    <div className="ds-container flex flex-col h-screen">
      {/* Header */}
      <div className="ds-container-secondary ds-border-bottom p-lg">
        <div className="ds-flex-between">
          <h1 className="text-xl font-semibold ds-text-primary">Focus Center</h1>
          <div className="flex gap-sm">
            <button
              className={`ds-button ds-button-small ${
                activeTab === 'focus' 
                  ? 'ds-button-primary' 
                  : 'ds-button-secondary'
              }`}
              onClick={() => setActiveTab('focus')}
            >
              Focus
            </button>
            <button
              className={`ds-button ds-button-small ${
                activeTab === 'habits' 
                  ? 'ds-button-primary' 
                  : 'ds-button-secondary'
              }`}
              onClick={() => setActiveTab('habits')}
            >
              Habits
            </button>
            <button
              className={`ds-button ds-button-small ${
                activeTab === 'pillars' 
                  ? 'ds-button-primary' 
                  : 'ds-button-secondary'
              }`}
              onClick={() => setActiveTab('pillars')}
            >
              Pillars
            </button>
            <button
              className={`ds-button ds-button-small ${
                activeTab === 'metrics' 
                  ? 'ds-button-primary' 
                  : 'ds-button-secondary'
              }`}
              onClick={() => setActiveTab('metrics')}
            >
              Metrics
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 overflow-y-auto p-lg">
        {activeTab === 'focus' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-lg">
            {/* Focus Session */}
            <div className="ds-card p-lg">
              <div className="ds-flex-between mb-md">
                <h2 className="text-lg font-semibold ds-text-primary">Focus Session</h2>
                <AppleWatchIcon name="focus" size="md" />
              </div>
              
              <div className="text-center mb-lg">
                <div className="text-4xl font-bold ds-text-primary mb-sm">
                  {formatTime(sessionDuration)}
                </div>
                <div className="text-sm ds-text-secondary">
                  {isSessionActive ? 'Session in progress' : 'Ready to focus'}
                </div>
              </div>
              
              <div className="flex gap-sm">
                {!isSessionActive ? (
                  <button
                    className="ds-button ds-button-primary flex-1 py-md"
                    onClick={startFocusSession}
                  >
                    Start Session
                  </button>
                ) : (
                  <button
                    className="ds-button ds-button-danger flex-1 py-md"
                    onClick={stopFocusSession}
                  >
                    End Session
                  </button>
                )}
              </div>
            </div>

            {/* Breathing Exercise */}
            <div className="ds-card p-lg">
              <div className="ds-flex-between mb-md">
                <h2 className="text-lg font-semibold ds-text-primary">Box Breathing</h2>
                <div className="text-sm ds-text-secondary bg-bg-tertiary px-sm py-xs rounded-apple">
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
                <div className="text-sm ds-text-secondary">
                  {phaseCountdown}s remaining
                </div>
                <div className="text-md ds-text-primary mt-sm">
                  Breaths: {Math.floor(breathingCount / 4)}
                </div>
              </div>
              
              <div className="flex gap-sm">
                {!isBreathingActive ? (
                  <button
                    className="ds-button ds-button-primary flex-1 py-md"
                    onClick={startBreathingExercise}
                  >
                    Start Breathing
                  </button>
                ) : (
                  <button
                    className="ds-button ds-button-danger flex-1 py-md"
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
            <div className="ds-card p-lg">
              <div className="ds-flex-between mb-md">
                <h2 className="text-lg font-semibold ds-text-primary">Daily Habits</h2>
                <AppleWatchIcon name="chart" size="md" />
              </div>
              
              {config?.focusPage?.habits && config.focusPage.habits.length > 0 ? (
                <div className="space-y-sm">
                                     {config.focusPage.habits.map((habit: Habit) => (
                    <div
                      key={habit.id}
                      className="ds-flex-start gap-md p-md bg-bg-tertiary rounded-apple ds-border"
                      style={{ borderLeftColor: habit.color, borderLeftWidth: '4px' }}
                    >
                      <div
                        className="w-4 h-4 rounded-full"
                        style={{ backgroundColor: habit.color }}
                      />
                      <div className="flex-1">
                        <div className="text-md font-medium ds-text-primary">{habit.name}</div>
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
                                        {config.focusPage.pillars.map((pillar: Pillar) => (
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
                         &ldquo;{pillar.quote}&rdquo;
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

         {activeTab === 'metrics' && (
           <div className="space-y-lg">
             {/* Tab Usage Metrics */}
             <div className="bg-bg-secondary rounded-apple p-lg border border-bg-tertiary">
               <div className="flex items-center justify-between mb-md">
                 <h2 className="text-lg font-semibold text-text-primary">Tab Usage</h2>
                 <AppleWatchIcon name="document" size="md" />
               </div>
               
               <div className="grid grid-cols-2 gap-md">
                 <div className="text-center p-md bg-bg-tertiary rounded-apple">
                   <div className="text-2xl font-bold text-text-primary mb-xs">
                     {storageData?.tabCount || 0}
                   </div>
                   <div className="text-sm text-text-secondary">Open Tabs</div>
                 </div>
                 <div className="text-center p-md bg-bg-tertiary rounded-apple">
                   <div className="text-2xl font-bold text-text-primary mb-xs">
                     {config?.tabLimiter?.maxTabs || 3}
                   </div>
                   <div className="text-sm text-text-secondary">Tab Limit</div>
                 </div>
               </div>
             </div>

             {/* Search Metrics */}
             <div className="bg-bg-secondary rounded-apple p-lg border border-bg-tertiary">
               <div className="flex items-center justify-between mb-md">
                 <h2 className="text-lg font-semibold text-text-primary">Search Activity</h2>
                 <AppleWatchIcon name="search" size="md" />
               </div>
               
               <div className="grid grid-cols-2 gap-md">
                 <div className="text-center p-md bg-bg-tertiary rounded-apple">
                   <div className="text-2xl font-bold text-text-primary mb-xs">
                     {storageData?.savedSearches?.length || 0}
                   </div>
                   <div className="text-sm text-text-secondary">Saved Searches</div>
                 </div>
                 <div className="text-center p-md bg-bg-tertiary rounded-apple">
                   <div className="text-2xl font-bold text-text-primary mb-xs">
                     {config?.smartSearch?.enabled ? 'On' : 'Off'}
                   </div>
                   <div className="text-sm text-text-secondary">Smart Search</div>
                 </div>
               </div>
             </div>

             {/* Distraction Blocker Metrics */}
             <div className="bg-bg-secondary rounded-apple p-lg border border-bg-tertiary">
               <div className="flex items-center justify-between mb-md">
                 <h2 className="text-lg font-semibold text-text-primary">Distraction Control</h2>
                 <AppleWatchIcon name="ban" size="md" />
               </div>
               
               <div className="grid grid-cols-2 gap-md">
                 <div className="text-center p-md bg-bg-tertiary rounded-apple">
                   <div className="text-2xl font-bold text-text-primary mb-xs">
                     {config?.distractionBlocker?.domains?.length || 0}
                   </div>
                   <div className="text-sm text-text-secondary">Blocked Domains</div>
                 </div>
                 <div className="text-center p-md bg-bg-tertiary rounded-apple">
                   <div className="text-2xl font-bold text-text-primary mb-xs">
                     {config?.distractionBlocker?.enabled ? 'Active' : 'Inactive'}
                   </div>
                   <div className="text-sm text-text-secondary">Blocker Status</div>
                 </div>
               </div>
               
               {storageData?.distractingDomains && storageData.distractingDomains.length > 0 && (
                 <div className="mt-md">
                   <div className="text-sm font-medium text-text-primary mb-sm">Domain Usage Today:</div>
                   <div className="space-y-xs">
                                            {storageData.distractingDomains.map((domain: any) => (
                       <div key={domain.domain} className="flex items-center justify-between p-sm bg-bg-tertiary rounded-apple">
                         <div className="text-sm text-text-primary">{domain.domain}</div>
                         <div className="text-sm text-text-secondary">
                           {domain.currentCount}/{domain.dailyLimit}
                         </div>
                       </div>
                     ))}
                   </div>
                 </div>
               )}
             </div>

             {/* Eye Care Metrics */}
             <div className="bg-bg-secondary rounded-apple p-lg border border-bg-tertiary">
               <div className="flex items-center justify-between mb-md">
                 <h2 className="text-lg font-semibold text-text-primary">Eye Care</h2>
                 <AppleWatchIcon name="eye" size="md" />
               </div>
               
               <div className="grid grid-cols-2 gap-md">
                 <div className="text-center p-md bg-bg-tertiary rounded-apple">
                   <div className="text-2xl font-bold text-text-primary mb-xs">
                     {config?.eyeCare?.enabled ? 'Active' : 'Inactive'}
                   </div>
                   <div className="text-sm text-text-secondary">20-20-20 Rule</div>
                 </div>
                 <div className="text-center p-md bg-bg-tertiary rounded-apple">
                   <div className="text-2xl font-bold text-text-primary mb-xs">
                     {Math.round((config?.eyeCare?.soundVolume || 0.5) * 100)}%
                   </div>
                   <div className="text-sm text-text-secondary">Sound Volume</div>
                 </div>
               </div>
             </div>

             {/* Video Focus Metrics */}
             <div className="bg-bg-secondary rounded-apple p-lg border border-bg-tertiary">
               <div className="flex items-center justify-between mb-md">
                 <h2 className="text-lg font-semibold text-text-primary">Video Focus</h2>
                 <AppleWatchIcon name="video" size="md" />
               </div>
               
               <div className="grid grid-cols-2 gap-md">
                 <div className="text-center p-md bg-bg-tertiary rounded-apple">
                   <div className="text-2xl font-bold text-text-primary mb-xs">
                     {config?.videoFocus?.enabled ? 'Active' : 'Inactive'}
                   </div>
                   <div className="text-sm text-text-secondary">Focus Mode</div>
                 </div>
                 <div className="text-center p-md bg-bg-tertiary rounded-apple">
                   <div className="text-2xl font-bold text-text-primary mb-xs">
                     {config?.videoFocus?.preventTabSwitch ? 'On' : 'Off'}
                   </div>
                   <div className="text-sm text-text-secondary">Tab Lock</div>
                 </div>
               </div>
             </div>

             {/* Habit Tracking Metrics */}
             <div className="bg-bg-secondary rounded-apple p-lg border border-bg-tertiary">
               <div className="flex items-center justify-between mb-md">
                 <h2 className="text-lg font-semibold text-text-primary">Habit Progress</h2>
                 <AppleWatchIcon name="chart" size="md" />
               </div>
               
               <div className="grid grid-cols-2 gap-md">
                 <div className="text-center p-md bg-bg-tertiary rounded-apple">
                   <div className="text-2xl font-bold text-text-primary mb-xs">
                     {config?.focusPage?.habits?.length || 0}
                   </div>
                   <div className="text-sm text-text-secondary">Total Habits</div>
                 </div>
                 <div className="text-center p-md bg-bg-tertiary rounded-apple">
                   <div className="text-2xl font-bold text-text-primary mb-xs">
                     {storageData?.habitEntries?.length || 0}
                   </div>
                   <div className="text-sm text-text-secondary">Habit Entries</div>
                 </div>
               </div>
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