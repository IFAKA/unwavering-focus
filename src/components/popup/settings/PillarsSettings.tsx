import React, { useState } from 'react';
import { useConfig } from '../../../hooks/useConfig';
import { Pillar } from '../../../types';
import SettingsHeader from '../../ui/SettingsHeader';
import SettingsSection from '../../ui/SettingsSection';
import AppleWatchButton from '../../ui/AppleWatchButton';
import AppleWatchIcon from '../../ui/AppleWatchIcon';
import ColorInput from '../../ui/ColorInput';

interface PillarsSettingsProps {
  onNavigateBack: () => void;
}

type PillarsSection = 'main' | 'list' | 'add';

const PillarsSettings: React.FC<PillarsSettingsProps> = ({ onNavigateBack }) => {
  const { config, updateConfig } = useConfig();
  const [currentSection, setCurrentSection] = useState<PillarsSection>('main');
  const [newPillarQuote, setNewPillarQuote] = useState('');
  const [newPillarDescription, setNewPillarDescription] = useState('');
  const [newPillarColor, setNewPillarColor] = useState('#007aff');

  const addPillar = async () => {
    if (!config) return;
    
    const pillarQuote = newPillarQuote.trim();
    if (pillarQuote) {
      // Check for duplicates
      const existingPillar = config.focusPage.pillars.find(
        p => p.quote.toLowerCase() === pillarQuote.toLowerCase()
      );
      
      if (existingPillar) {
        return;
      }

      const newPillar: Pillar = {
        id: Date.now().toString(),
        quote: pillarQuote,
        description: newPillarDescription || "Your core principle",
        color: newPillarColor
      };
      
      const updatedConfig = {
        ...config,
        focusPage: {
          ...config.focusPage,
          pillars: [newPillar, ...config.focusPage.pillars]
        }
      };
      
      await updateConfig('focusPage.pillars', updatedConfig.focusPage.pillars);
      setNewPillarQuote('');
      setNewPillarDescription('');
      setNewPillarColor('#007aff');
      setCurrentSection('main');
    }
  };

  const updatePillar = async (index: number, updates: Partial<Pillar>) => {
    if (!config) return;
    
    const pillars = [...config.focusPage.pillars];
    pillars[index] = { ...pillars[index], ...updates };
    
    await updateConfig('focusPage.pillars', pillars);
  };

  const removePillar = async (index: number) => {
    if (!config) return;
    
    const pillars = config.focusPage.pillars.length > 0 ? config.focusPage.pillars.filter((_, i) => i !== index) : [];
    await updateConfig('focusPage.pillars', pillars);
  };

  const renderMainMenu = () => (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Pillars"
        onNavigateBack={onNavigateBack}
      />
      
      <div className="flex flex-col gap-sm">
        <SettingsSection
          id="my-pillars"
          title="My Pillars"
                      subtitle={`${(config?.focusPage?.pillars?.length || 0)}/3 pillars`}
          icon="building"
          onClick={() => setCurrentSection('list')}
        />
        
        {(config?.focusPage?.pillars?.length || 0) < 3 && (
          <SettingsSection
            id="add-pillar"
            title="Add Pillar"
            subtitle="Create a new core principle"
            icon="plus"
            onClick={() => setCurrentSection('add')}
          />
        )}
      </div>
    </div>
  );

  const renderPillarsList = () => (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="My Pillars"
        onNavigateBack={() => setCurrentSection('main')}
      />
      
      <div className="flex flex-col gap-sm">
        {(config?.focusPage?.pillars?.length || 0) > 0 ? (
          (config?.focusPage?.pillars || []).map((pillar, index) => (
            <div key={pillar.id} className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
              <div className="flex flex-col gap-sm">
                <div className="flex items-center gap-sm">
                  <input
                    type="text"
                    value={pillar.quote}
                    onChange={(e) => updatePillar(index, { quote: e.target.value })}
                    placeholder="Pillar quote"
                    maxLength={50}
                    className="flex-1 bg-bg-tertiary text-text-primary px-sm py-xs rounded border-none text-sm"
                  />
                  <ColorInput
                    value={pillar.color}
                    onChange={(color) => updatePillar(index, { color })}
                  />
                  <button
                    className="w-6 h-6 bg-danger-color text-white rounded-full flex items-center justify-center text-sm hover:bg-[#dc2626] transition-colors"
                    onClick={() => removePillar(index)}
                    title="Remove pillar"
                  >
                    ×
                  </button>
                </div>
                <textarea
                  value={pillar.description}
                  onChange={(e) => updatePillar(index, { description: e.target.value })}
                  placeholder="Description"
                  maxLength={100}
                  className="w-full bg-bg-tertiary text-text-primary px-sm py-xs rounded border-none text-sm resize-none"
                  rows={2}
                />
              </div>
            </div>
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-xl text-center">
            <div className="text-4xl mb-sm opacity-50">
              <AppleWatchIcon name="building" size="xl" />
            </div>
            <div className="text-md font-semibold text-text-primary mb-xs">No Pillars</div>
            <div className="text-sm text-text-secondary">Add pillars to define your core principles</div>
          </div>
        )}
      </div>
    </div>
  );

  const renderAddPillar = () => (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Add Pillar"
        onNavigateBack={() => setCurrentSection('main')}
      />
      
      <div className="flex flex-col gap-md">
        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex flex-col gap-sm">
            <input
              type="text"
              placeholder="Add pillar quote"
              value={newPillarQuote}
              onChange={(e) => setNewPillarQuote(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addPillar()}
              maxLength={50}
              className="w-full bg-bg-tertiary text-text-primary px-sm py-xs rounded border-none text-sm"
            />
            <textarea
              placeholder="Description"
              value={newPillarDescription}
              onChange={(e) => setNewPillarDescription(e.target.value)}
              maxLength={100}
              className="w-full bg-bg-tertiary text-text-primary px-sm py-xs rounded border-none text-sm resize-none"
              rows={2}
            />
            <div className="flex items-center gap-sm">
              <ColorInput
                value={newPillarColor}
                onChange={setNewPillarColor}
              />
              <AppleWatchButton
                variant="primary"
                size="small"
                onClick={addPillar}
              >
                +
              </AppleWatchButton>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  switch (currentSection) {
    case 'main':
      return renderMainMenu();
    case 'list':
      return renderPillarsList();
    case 'add':
      return renderAddPillar();
    default:
      return renderMainMenu();
  }
};

export default PillarsSettings; 