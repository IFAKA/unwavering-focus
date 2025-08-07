import React, { useState } from 'react';
import { useConfig } from '../../../hooks/useConfig';
import { Habit } from '../../../types';
import SettingsHeader from '../../ui/SettingsHeader';
import SettingsSection from '../../ui/SettingsSection';
import AppleWatchButton from '../../ui/AppleWatchButton';
import AppleWatchIcon from '../../ui/AppleWatchIcon';
import ColorInput from '../../ui/ColorInput';

interface HabitsSettingsProps {
  onNavigateBack: () => void;
}

type HabitsSection = 'main' | 'list' | 'add';

const HabitsSettings: React.FC<HabitsSettingsProps> = ({ onNavigateBack }) => {
  const { config, updateConfig } = useConfig();
  const [currentSection, setCurrentSection] = useState<HabitsSection>('main');
  const [newHabitName, setNewHabitName] = useState('');
  const [newHabitColor, setNewHabitColor] = useState('#007aff');

  const addHabit = async () => {
    if (!config) return;
    
    const habitName = newHabitName.trim();
    if (habitName) {
      // Check for duplicates
      const existingHabit = config.focusPage.habits.find(
        h => h.name.toLowerCase() === habitName.toLowerCase()
      );
      
      if (existingHabit) {
        return;
      }

      const newHabit: Habit = {
        id: Date.now().toString(),
        name: habitName,
        color: newHabitColor
      };
      
      const updatedConfig = {
        ...config,
        focusPage: {
          ...config.focusPage,
          habits: [newHabit, ...config.focusPage.habits]
        }
      };
      
      await updateConfig('focusPage.habits', updatedConfig.focusPage.habits);
      setNewHabitName('');
      setNewHabitColor('#007aff');
      setCurrentSection('main');
    }
  };

  const updateHabit = async (index: number, updates: Partial<Habit>) => {
    if (!config) return;
    
    const habits = [...config.focusPage.habits];
    habits[index] = { ...habits[index], ...updates };
    
    await updateConfig('focusPage.habits', habits);
  };

  const removeHabit = async (index: number) => {
    if (!config) return;
    
    const habits = config.focusPage.habits.filter((_, i) => i !== index);
    await updateConfig('focusPage.habits', habits);
  };

  const renderMainMenu = () => (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Habits"
        onNavigateBack={onNavigateBack}
      />
      
      <div className="flex flex-col gap-sm">
        <SettingsSection
          id="my-habits"
          title="My Habits"
                      subtitle={`${(config?.focusPage?.habits?.length || 0)}/5 habits`}
          icon="chart"
          onClick={() => setCurrentSection('list')}
        />
        
        {(config?.focusPage?.habits?.length || 0) < 5 && (
          <SettingsSection
            id="add-habit"
            title="Add Habit"
            subtitle="Create a new daily habit"
            icon="plus"
            onClick={() => setCurrentSection('add')}
          />
        )}
      </div>
    </div>
  );

  const renderHabitsList = () => (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="My Habits"
        onNavigateBack={() => setCurrentSection('main')}
      />
      
      <div className="flex flex-col gap-sm">
        {(config?.focusPage?.habits?.length || 0) > 0 ? (
          (config?.focusPage?.habits || []).map((habit, index) => (
            <div key={habit.id} className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
              <div className="flex items-center gap-sm">
                <input
                  type="text"
                  value={habit.name}
                  onChange={(e) => updateHabit(index, { name: e.target.value })}
                  placeholder="Habit name"
                  maxLength={20}
                  className="flex-1 bg-bg-tertiary text-text-primary px-sm py-xs rounded border-none text-sm"
                />
                <ColorInput
                  value={habit.color}
                  onChange={(color) => updateHabit(index, { color })}
                />
                <button
                  className="w-6 h-6 bg-danger-color text-white rounded-full flex items-center justify-center text-sm hover:bg-[#dc2626] transition-colors"
                  onClick={() => removeHabit(index)}
                  title="Remove habit"
                >
                  ×
                </button>
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div className="text-4xl mb-sm opacity-50">
              <AppleWatchIcon name="chart" size="xl" />
            </div>
            <div className="text-md font-semibold text-text-primary mb-xs">No Habits</div>
            <div className="text-sm text-text-secondary">Add habits to track your daily progress</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAddHabit = () => (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Add Habit"
        onNavigateBack={() => setCurrentSection('main')}
      />
      
      <div className="flex flex-col gap-md">
        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center gap-sm">
            <input
              type="text"
              placeholder="Add habit"
              value={newHabitName}
              onChange={(e) => setNewHabitName(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addHabit()}
              maxLength={20}
              className="flex-1 bg-bg-tertiary text-text-primary px-sm py-xs rounded border-none text-sm"
            />
            <ColorInput
              value={newHabitColor}
              onChange={setNewHabitColor}
            />
            <AppleWatchButton
              variant="primary"
              size="small"
              onClick={addHabit}
            >
              +
            </AppleWatchButton>
          </div>
        </div>
      </div>
    </div>
  );

  switch (currentSection) {
    case 'main':
      return renderMainMenu();
    case 'list':
      return renderHabitsList();
    case 'add':
      return renderAddHabit();
    default:
      return renderMainMenu();
  }
};

export default HabitsSettings; 