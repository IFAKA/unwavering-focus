import React from 'react';
import SettingsHeader from '../../ui/SettingsHeader';
import SettingsSection from '../../ui/SettingsSection';

interface SettingsMainProps {
  onNavigateToMain: () => void;
  onNavigateToSection: (section: 'main' | 'smartSearch' | 'tabLimiter' | 'blocker' | 'care' | 'videoFocus' | 'contentFocus') => void;
}

const SettingsMain: React.FC<SettingsMainProps> = ({ onNavigateToMain, onNavigateToSection }) => {
  const settingsSections = [
    {
      id: 'smartSearch',
      title: 'Smart Search',
      subtitle: 'Save and search thoughts',
      icon: 'search',
      onClick: () => onNavigateToSection('smartSearch')
    },
    {
      id: 'tabLimiter',
      title: 'Tab Limiter',
      subtitle: 'Limit open tabs',
      icon: 'document',
      onClick: () => onNavigateToSection('tabLimiter')
    },

    {
      id: 'blocker',
      title: 'Blocker',
      subtitle: 'Block distractions',
      icon: 'ban',
      onClick: () => onNavigateToSection('blocker')
    },
    {
      id: 'care',
      title: 'Eye Care',
      subtitle: '20-20-20 rule timer',
      icon: 'eye',
      onClick: () => onNavigateToSection('care')
    },
    {
      id: 'videoFocus',
      title: 'Video Focus',
      subtitle: 'YouTube distraction control',
      icon: 'video',
      onClick: () => onNavigateToSection('videoFocus')
    },
    {
      id: 'contentFocus',
      title: 'Content Focus',
      subtitle: 'Hide distracting content',
      icon: 'globe',
      onClick: () => onNavigateToSection('contentFocus')
    }
  ];

  return (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Settings"
        onNavigateBack={onNavigateToMain}
      />
      
      <div className="flex flex-col gap-sm">
        {settingsSections.map((section) => (
          <SettingsSection
            key={section.id}
            id={section.id}
            title={section.title}
            subtitle={section.subtitle}
            icon={section.icon}
            onClick={section.onClick}
          />
        ))}
      </div>
    </div>
  );
};

export default SettingsMain; 