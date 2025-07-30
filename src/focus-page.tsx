import React, { useState, useEffect } from 'react';
import ReactDOM from 'react-dom';
import { ExtensionConfig, Habit, HabitEntry } from './types';
import { 
  getHabitGridData, 
  calculateConsistency, 
  calculateOverallMasteryScore,
  getReinforcementMessage,
  getStatusColor,
  getStatusLabel,
  getDateString
} from './utils/habitUtils';
import './focus-page.scss';

// Define default config locally
const defaultConfig: ExtensionConfig = {
  smartSearch: { 
    enabled: true,
    searchAllEnabled: true 
  },
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

interface StoicQuote {
  text: string;
  author: string;
}

interface FocusPageProps {}

const FocusPage: React.FC<FocusPageProps> = () => {
  const [config, setConfig] = useState<ExtensionConfig | null>(null);
  const [habitEntries, setHabitEntries] = useState<HabitEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [today] = useState(getDateString());
  const [stoicQuote, setStoicQuote] = useState<StoicQuote | null>(null);

  useEffect(() => {
    loadData();
    loadStoicQuote();
  }, []);

  const loadData = async () => {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
      
      setConfig(defaultConfig);
      setHabitEntries([]);
      
      if (response && typeof response === 'object') {
        setConfig(response.config || defaultConfig);
        setHabitEntries(response.habitEntries || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setConfig(defaultConfig);
      setHabitEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const loadStoicQuote = async () => {
    try {
      const response = await fetch('https://stoic-quotes.com/api/quote');
      const quote: StoicQuote = await response.json();
      setStoicQuote(quote);
    } catch (error) {
      console.error('Error loading Stoic quote:', error);
      setStoicQuote({
        text: "All that exists is the seed of what will emerge from it.",
        author: "Marcus Aurelius"
      });
    }
  };

  const updateHabitEntry = async (habitId: string, status: 'excellent' | 'good' | 'not-done') => {
    try {
      await chrome.runtime.sendMessage({
        type: 'UPDATE_HABIT_ENTRY',
        habitId,
        date: today,
        status
      });
      
      // Update local state immediately
      setHabitEntries(prev => {
        const existing = prev.find(entry => entry.habitId === habitId && entry.date === today);
        if (existing) {
          return prev.map(entry => 
            entry.habitId === habitId && entry.date === today 
              ? { ...entry, status }
              : entry
          );
        } else {
          return [...prev, { habitId, date: today, status }];
        }
      });
    } catch (error) {
      console.error('Error updating habit entry:', error);
    }
  };

  const getTodayStatus = (habitId: string): 'excellent' | 'good' | 'not-done' | null => {
    const entry = habitEntries.find(e => e.habitId === habitId && e.date === today);
    return entry ? entry.status : null;
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

  const habits = config?.focusPage?.habits || [];
  const masteryScore = calculateOverallMasteryScore(habits, habitEntries);
  const reinforcementMessage = getReinforcementMessage(masteryScore, config?.focusPage?.reinforcementMessages || {
    high: "Your discipline forges your excellence.",
    medium: "Stay consistent. Progress builds momentum.",
    low: "Regain control. Small actions today build momentum."
  });

  return (
    <div className="focus-container">
      {/* Apple Watch Style Header - Essential Metrics */}
      <div className="watch-header">
        <div className="metric-group">
          <div className="metric-item">
            <div className="metric-icon">🎯</div>
            <div className="metric-value">{masteryScore}%</div>
            <div className="metric-label">Mastery</div>
          </div>
          <div className="metric-item">
            <div className="metric-icon">📊</div>
            <div className="metric-value">{habits.length}</div>
            <div className="metric-label">Habits</div>
          </div>
        </div>
      </div>

      {/* Quick Actions - Minimal, Essential */}
      <div className="quick-actions">
        <button 
          className="action-btn primary"
          onClick={() => chrome.runtime.openOptionsPage()}
          title="Configure habits"
        >
          ⚙️ Configure Habits
        </button>
        
        <div className="action-row">
          <button 
            className="action-btn secondary"
            onClick={() => window.history.back()}
            title="Go back"
          >
            ← Back
          </button>
          <button 
            className="action-btn secondary"
            onClick={() => chrome.tabs.create({ url: 'https://www.google.com' })}
            title="Start working"
          >
            🚀 Start Work
          </button>
        </div>
      </div>

      {/* Today's Habits - Compact, Scrollable */}
      {habits.length > 0 ? (
        <div className="habits-list">
          <div className="list-header">
            <span className="list-title">Today's Habits</span>
            <span className="list-count">{habits.length}</span>
          </div>
          <div className="list-content">
            {habits.slice(0, 3).map((habit) => {
              const todayStatus = getTodayStatus(habit.id);
              return (
                <div key={habit.id} className="habit-item">
                  <div className="habit-info">
                    <div className="habit-name" title={habit.name}>
                      {habit.name.length > 20 ? habit.name.substring(0, 20) + '...' : habit.name}
                    </div>
                    <div className="habit-status">
                      {todayStatus ? (
                        <span className={`status-badge ${todayStatus}`}>
                          {getStatusLabel(todayStatus)}
                        </span>
                      ) : (
                        <span className="status-badge pending">Not Done</span>
                      )}
                    </div>
                  </div>
                  {!todayStatus && (
                    <div className="habit-actions">
                      <button 
                        className="status-btn excellent"
                        onClick={() => updateHabitEntry(habit.id, 'excellent')}
                        title="Mark as excellent"
                      >
                        ⭐
                      </button>
                      <button 
                        className="status-btn good"
                        onClick={() => updateHabitEntry(habit.id, 'good')}
                        title="Mark as good"
                      >
                        ✓
                      </button>
                      <button 
                        className="status-btn not-done"
                        onClick={() => updateHabitEntry(habit.id, 'not-done')}
                        title="Mark as not done"
                      >
                        ✕
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
            {habits.length > 3 && (
              <div className="more-indicator">
                +{habits.length - 3} more habits
              </div>
            )}
          </div>
        </div>
      ) : (
        <div className="empty-state">
          <div className="empty-icon">📊</div>
          <div className="empty-title">No Habits Configured</div>
          <div className="empty-message">Configure your pillar habits in settings to start tracking</div>
        </div>
      )}

      {/* Status Indicators - Minimal */}
      <div className="status-indicators">
        <div className={`status-dot ${habits.length > 0 ? 'active' : 'inactive'}`} title="Habits Configured">
          📊
        </div>
        <div className={`status-dot ${masteryScore > 70 ? 'active' : 'inactive'}`} title="High Mastery">
          🎯
        </div>
        <div className={`status-dot ${habits.some(h => getTodayStatus(h.id)) ? 'active' : 'inactive'}`} title="Today's Progress">
          ✅
        </div>
      </div>
    </div>
  );
};

// Render the focus page
const root = document.getElementById('root');
if (root) {
  ReactDOM.render(<FocusPage />, root);
} 