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
      console.log('Loading focus page data...');
      const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
      console.log('Received focus page data:', response);
      
      // Set default values regardless of response
      setConfig(defaultConfig);
      setHabitEntries([]);
      
      // If we got a valid response, use it
      if (response && typeof response === 'object') {
        setConfig(response.config || defaultConfig);
        setHabitEntries(response.habitEntries || []);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      // Set default values if loading fails
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
      // Fallback quote
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
      
      // Update local state
      const existingIndex = habitEntries.findIndex(e => 
        e.habitId === habitId && e.date === today
      );
      
      if (existingIndex >= 0) {
        const updated = [...habitEntries];
        updated[existingIndex].status = status;
        setHabitEntries(updated);
      } else {
        setHabitEntries([...habitEntries, {
          habitId,
          date: today,
          status
        }]);
      }
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
      <div className="focus-page">
        <div className="loading">Loading...</div>
      </div>
    );
  }

  // Always show the UI with default config if no config is loaded
  const configToUse = config || defaultConfig;

  const masteryScore = calculateOverallMasteryScore(configToUse.focusPage.habits, habitEntries);
  const reinforcementMessage = getReinforcementMessage(masteryScore, configToUse.focusPage.reinforcementMessages);

  return (
    <div className="focus-page">
      <div className="focus-header">
        <h1>{stoicQuote ? stoicQuote.text : configToUse.focusPage.motivationalMessage}</h1>
        {stoicQuote && (
          <p className="quote-author">— {stoicQuote.author}</p>
        )}
        <div className="mastery-score">
          <span className="score-label">Mastery Score</span>
          <span className="score-value">{masteryScore}%</span>
        </div>
      </div>

      <div className="focus-content">
        <div className="habits-dashboard">
          <h2>Daily Mastery</h2>
          
          {configToUse.focusPage.habits.length === 0 ? (
            <div className="empty-habits">
              <p>No habits configured yet.</p>
              <p>Go to extension options to set up your pillar habits.</p>
            </div>
          ) : (
            <div className="habits-list">
              {configToUse.focusPage.habits.map(habit => {
                const gridData = getHabitGridData(habitEntries, habit.id);
                const consistency = calculateConsistency(
                  habitEntries.filter(e => e.habitId === habit.id)
                );
                const todayStatus = getTodayStatus(habit.id);

                return (
                  <div key={habit.id} className="habit-card">
                    <div className="habit-header">
                      <h3 style={{ color: habit.color }}>{habit.name}</h3>
                      <span className="consistency">{consistency}% (30 days)</span>
                    </div>

                    <div className="habit-grid">
                      {gridData.map((status, index) => (
                        <div
                          key={index}
                          className="grid-cell"
                          style={{
                            backgroundColor: status ? getStatusColor(status) : 'transparent',
                            border: status ? 'none' : '1px solid #e5e7eb'
                          }}
                          title={`${status ? getStatusLabel(status) : 'No data'}`}
                        />
                      ))}
                    </div>

                    <div className="habit-actions">
                      <button
                        className={`action-btn excellent ${todayStatus === 'excellent' ? 'active' : ''}`}
                        onClick={() => updateHabitEntry(habit.id, 'excellent')}
                        disabled={todayStatus !== null}
                      >
                        Excellent
                      </button>
                      <button
                        className={`action-btn good ${todayStatus === 'good' ? 'active' : ''}`}
                        onClick={() => updateHabitEntry(habit.id, 'good')}
                        disabled={todayStatus !== null}
                      >
                        Good
                      </button>
                      <button
                        className={`action-btn not-done ${todayStatus === 'not-done' ? 'active' : ''}`}
                        onClick={() => updateHabitEntry(habit.id, 'not-done')}
                        disabled={todayStatus !== null}
                      >
                        Not Done
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        <div className="reinforcement-section">
          <div className="reinforcement-message">
            <h3>Today's Focus</h3>
            <p>{reinforcementMessage}</p>
          </div>
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