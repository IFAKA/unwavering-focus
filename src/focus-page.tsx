import React, { useState, useEffect } from 'react';
import ErrorBoundary from './components/ErrorBoundary';
import { ExtensionConfig, Habit, Pillar, HabitEntry } from './types';
import AppleWatchIcon from './components/ui/AppleWatchIcon';
import './styles.css';

const FocusPage: React.FC = () => {
  const [config, setConfig] = useState<ExtensionConfig | null>(null);
  const [loading, setLoading] = useState(true);
  const [storageData, setStorageData] = useState<any>(null);
  const [todayHabits, setTodayHabits] = useState<HabitEntry[]>([]);
  
  // Calculate mastery score based on habit completion
  const calculateMasteryScore = () => {
    if (!config?.focusPage?.habits || config.focusPage.habits.length === 0) return 0;
    
    const today = new Date().toISOString().split('T')[0];
    const completedHabits = todayHabits.filter(entry => 
      entry.date === today && entry.status !== 'not-done'
    ).length;
    
    return Math.round((completedHabits / config.focusPage.habits.length) * 100);
  };

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
      setConfig(response?.config || null);
      setStorageData(response || null);
      
      // Load today's habit entries
      if (response?.habitEntries) {
        const today = new Date().toISOString().split('T')[0];
        const todayEntries = response.habitEntries.filter((entry: HabitEntry) => 
          entry.date === today
        );
        setTodayHabits(todayEntries);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateHabitStatus = async (habitId: string, status: 'excellent' | 'good' | 'not-done') => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      await chrome.runtime.sendMessage({
        type: 'UPDATE_HABIT_ENTRY',
        habitId,
        date: today,
        status
      });
      
      // Update local state
      setTodayHabits(prev => {
        const existing = prev.find(entry => entry.habitId === habitId);
        if (existing) {
          return prev.map(entry => 
            entry.habitId === habitId ? { ...entry, status } : entry
          );
        } else {
          return [...prev, { habitId, date: today, status }];
        }
      });
    } catch (error) {
      console.error('Error updating habit status:', error);
    }
  };

  const getHabitStatus = (habitId: string) => {
    return todayHabits.find(entry => entry.habitId === habitId)?.status || 'not-done';
  };

  const getStatusColor = (status: 'excellent' | 'good' | 'not-done') => {
    switch (status) {
      case 'excellent': return 'bg-accent-success';
      case 'good': return 'bg-accent-warning';
      case 'not-done': return 'bg-bg-tertiary';
    }
  };

  const getStatusIcon = (status: 'excellent' | 'good' | 'not-done') => {
    switch (status) {
      case 'excellent': return 'star';
      case 'good': return 'check';
      case 'not-done': return 'x';
    }
  };

  const getReinforcementMessage = () => {
    const masteryScore = calculateMasteryScore();
    if (!config?.focusPage?.reinforcementMessages) return '';
    
    if (masteryScore >= 80) return config.focusPage.reinforcementMessages.high;
    if (masteryScore >= 50) return config.focusPage.reinforcementMessages.medium;
    return config.focusPage.reinforcementMessages.low;
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

  const masteryScore = calculateMasteryScore();
  const habitCount = config?.focusPage?.habits?.length || 0;
  const pillarCount = config?.focusPage?.pillars?.length || 0;

  return (
    <div className="ds-container flex flex-col h-screen">
      {/* Header Metrics - 3 most important metrics in distinct cards */}
      <div className="p-md ds-border-bottom">
        <div className="grid grid-cols-3 gap-sm">
          {/* Mastery Score */}
          <div className="ds-card p-sm text-center">
            <div className="text-lg font-semibold ds-text-primary">{masteryScore}%</div>
            <div className="text-xs ds-text-secondary">Mastery</div>
          </div>
          
          {/* Habit Count */}
          <div className="ds-card p-sm text-center">
            <div className="text-lg font-semibold ds-text-primary">{habitCount}</div>
            <div className="text-xs ds-text-secondary">Habits</div>
          </div>
          
          {/* Pillar Count */}
          <div className="ds-card p-sm text-center">
            <div className="text-lg font-semibold ds-text-primary">{pillarCount}</div>
            <div className="text-xs ds-text-secondary">Pillars</div>
          </div>
        </div>
      </div>

      {/* Two-Column Layout */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Column - Core Pillars */}
        <div className="flex-1 p-md overflow-y-auto">
          <h2 className="text-md font-semibold ds-text-primary mb-sm">Core Pillars</h2>
          
          {config?.focusPage?.pillars && config.focusPage.pillars.length > 0 ? (
            <div className="space-y-sm">
              {config.focusPage.pillars.map((pillar: Pillar) => (
                <div
                  key={pillar.id}
                  className="ds-card p-sm"
                  style={{ borderLeftColor: pillar.color, borderLeftWidth: '3px' }}
                >
                  <div className="text-sm font-medium ds-text-primary mb-xs">
                    "{pillar.quote}"
                  </div>
                  <div className="text-xs ds-text-secondary">
                    {pillar.description}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="ds-card p-md text-center">
              <AppleWatchIcon name="building" size="md" className="text-text-secondary mb-sm" />
              <div className="text-sm ds-text-secondary">No pillars configured</div>
            </div>
          )}
        </div>

        {/* Right Column - Today's Habits */}
        <div className="flex-1 p-md overflow-y-auto ds-border-left">
          <h2 className="text-md font-semibold ds-text-primary mb-sm">Today's Habits</h2>
          
          {config?.focusPage?.habits && config.focusPage.habits.length > 0 ? (
            <div className="space-y-sm">
              {config.focusPage.habits.map((habit: Habit) => {
                const status = getHabitStatus(habit.id);
                const isCompleted = status !== 'not-done';
                
                return (
                  <div
                    key={habit.id}
                    className="ds-card p-sm"
                    style={{ borderLeftColor: habit.color, borderLeftWidth: '3px' }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="text-sm font-medium ds-text-primary">{habit.name}</div>
                      </div>
                      
                      {!isCompleted ? (
                        <div className="flex gap-xs">
                          <button
                            onClick={() => updateHabitStatus(habit.id, 'excellent')}
                            className="w-6 h-6 rounded-full bg-accent-success text-white text-xs font-bold flex items-center justify-center hover:scale-105 transition-transform"
                            title="Excellent"
                          >
                            ⭐
                          </button>
                          <button
                            onClick={() => updateHabitStatus(habit.id, 'good')}
                            className="w-6 h-6 rounded-full bg-accent-warning text-white text-xs font-bold flex items-center justify-center hover:scale-105 transition-transform"
                            title="Good"
                          >
                            ✓
                          </button>
                          <button
                            onClick={() => updateHabitStatus(habit.id, 'not-done')}
                            className="w-6 h-6 rounded-full bg-bg-tertiary text-text-secondary text-xs font-bold flex items-center justify-center hover:scale-105 transition-transform"
                            title="Not Done"
                          >
                            ✕
                          </button>
                        </div>
                      ) : (
                        <div className={`w-6 h-6 rounded-full ${getStatusColor(status)} text-white text-xs font-bold flex items-center justify-center`}>
                          {getStatusIcon(status) === 'star' ? '⭐' : getStatusIcon(status) === 'check' ? '✓' : '✕'}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="ds-card p-md text-center">
              <AppleWatchIcon name="chart" size="md" className="text-text-secondary mb-sm" />
              <div className="text-sm ds-text-secondary">No habits configured</div>
            </div>
          )}
        </div>
      </div>

      {/* Dynamic Reinforcement Message */}
      {getReinforcementMessage() && (
        <div className="p-md ds-border-top">
          <div className="ds-card p-sm text-center">
            <div className="text-sm ds-text-primary font-medium">
              {getReinforcementMessage()}
            </div>
          </div>
        </div>
      )}

      {/* Quick Actions Footer - One primary, two secondary */}
      <div className="p-md ds-border-top">
        <div className="flex gap-sm">
          <button 
            onClick={() => window.history.back()}
            className="flex-1 py-sm rounded-md bg-bg-tertiary text-text-primary font-medium transition-all duration-200 hover:bg-bg-secondary"
          >
            Back
          </button>
          <button 
            onClick={() => chrome.tabs.create({ url: chrome.runtime.getURL('popup.html') })}
            className="flex-1 py-sm rounded-md bg-accent-primary text-white font-medium transition-all duration-200 hover:bg-[#0056cc]"
          >
            Configure
          </button>
          <button 
            onClick={() => window.close()}
            className="flex-1 py-sm rounded-md bg-bg-tertiary text-text-primary font-medium transition-all duration-200 hover:bg-bg-secondary"
          >
            Work
          </button>
        </div>
      </div>

      {/* Status Indicators - Minimal status dots */}
      <div className="p-sm ds-border-top">
        <div className="flex justify-center gap-xs">
          <div className="w-2 h-2 rounded-full bg-accent-primary"></div>
          <div className="w-2 h-2 rounded-full bg-accent-success"></div>
          <div className="w-2 h-2 rounded-full bg-accent-warning"></div>
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