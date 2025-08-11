import React, { useState } from 'react';
import SettingsMain from './settings/SettingsMain';
import SmartSearchSettings from './settings/SmartSearchSettings';
import TabLimiterSettings from './settings/TabLimiterSettings';


import BlockerSettings from './settings/BlockerSettings';
import EyeCareSettings from './settings/EyeCareSettings';
import VideoFocusSettings from './settings/VideoFocusSettings';
import ContentFocusSettings from './settings/ContentFocusSettings';

interface PopupSettingsProps {
  onNavigateToMain: () => void;
}

type SettingsSection = 'main' | 'smartSearch' | 'tabLimiter' | 'blocker' | 'care' | 'videoFocus' | 'contentFocus';

const PopupSettings: React.FC<PopupSettingsProps> = ({ onNavigateToMain }) => {
  const [currentSection, setCurrentSection] = useState<SettingsSection>('main');

  const navigateToSection = (section: SettingsSection) => {
    setCurrentSection(section);
  };

  const navigateToMain = () => {
    setCurrentSection('main');
  };

  const renderCurrentSection = () => {
    switch (currentSection) {
      case 'main':
        return (
          <SettingsMain
            onNavigateToMain={onNavigateToMain}
            onNavigateToSection={navigateToSection}
          />
        );
      case 'smartSearch':
        return (
          <SmartSearchSettings
            onNavigateBack={navigateToMain}
          />
        );
      case 'tabLimiter':
        return (
          <TabLimiterSettings
            onNavigateBack={navigateToMain}
          />
        );

      case 'blocker':
        return (
          <BlockerSettings
            onNavigateBack={navigateToMain}
          />
        );
      case 'care':
        return (
          <EyeCareSettings
            onNavigateBack={navigateToMain}
          />
        );
      case 'videoFocus':
        return (
          <VideoFocusSettings
            onNavigateBack={navigateToMain}
          />
        );
      case 'contentFocus':
        return (
          <ContentFocusSettings
            onNavigateBack={navigateToMain}
          />
        );
      default:
        return (
          <SettingsMain
            onNavigateToMain={onNavigateToMain}
            onNavigateToSection={navigateToSection}
          />
        );
    }
  };

  return (
    <div className="flex-1 overflow-y-auto">
      {renderCurrentSection()}
    </div>
  );
};

export default PopupSettings; 