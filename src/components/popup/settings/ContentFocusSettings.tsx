import React, { useState } from 'react';
import { useConfig } from '../../../hooks/useConfig';
import SettingsHeader from '../../ui/SettingsHeader';
import ToggleSwitch from '../../ui/ToggleSwitch';
import SettingsSection from '../../ui/SettingsSection';

interface ContentFocusSettingsProps {
  onNavigateBack: () => void;
}

type ContentFocusSection = 'main' | 'video' | 'search' | 'global';

const ContentFocusSettings: React.FC<ContentFocusSettingsProps> = ({ onNavigateBack }) => {
  const { config, updateConfig } = useConfig();
  const [currentSection, setCurrentSection] = useState<ContentFocusSection>('main');

  const handleToggleSetting = (setting: string, enabled: boolean) => {
    updateConfig(`youtubeDistraction.${setting}`, enabled);
  };

  const renderMainMenu = () => (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Content Focus"
        onNavigateBack={onNavigateBack}
      />
      
      <div className="flex flex-col gap-sm">
        <SettingsSection
          id="video-page"
          title="Video Page"
          subtitle="6 settings for video pages"
          icon="video"
          onClick={() => setCurrentSection('video')}
        />
        <SettingsSection
          id="search-page"
          title="Search Page"
          subtitle="1 setting for search results"
          icon="search"
          onClick={() => setCurrentSection('search')}
        />
        <SettingsSection
          id="global"
          title="Global"
          subtitle="4 settings for all pages"
          icon="globe"
          onClick={() => setCurrentSection('global')}
        />
      </div>
    </div>
  );

  const renderVideoPageSettings = () => (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Video Page"
        onNavigateBack={() => setCurrentSection('main')}
      />
      
      <div className="flex flex-col gap-md">
        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Related Videos</div>
              <div className="text-xs text-text-secondary">Hide recommended videos sidebar</div>
            </div>
            <ToggleSwitch
              checked={config?.youtubeDistraction?.hideSecondary || false}
              onChange={(enabled) => handleToggleSetting('hideSecondary', enabled)}
            />
          </div>
        </div>

        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Channel Info</div>
              <div className="text-xs text-text-secondary">Hide channel name and subscribe button</div>
            </div>
            <ToggleSwitch
              checked={config?.youtubeDistraction?.hideOwner || false}
              onChange={(enabled) => handleToggleSetting('hideOwner', enabled)}
            />
          </div>
        </div>

        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Action Buttons</div>
              <div className="text-xs text-text-secondary">Hide download, thanks, and clip buttons</div>
            </div>
            <ToggleSwitch
              checked={config?.youtubeDistraction?.hideButtonShape || false}
              onChange={(enabled) => handleToggleSetting('hideButtonShape', enabled)}
            />
          </div>
        </div>

        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Author Thumbnail</div>
              <div className="text-xs text-text-secondary">Hide channel profile picture</div>
            </div>
            <ToggleSwitch
              checked={config?.youtubeDistraction?.hideAuthorThumbnail || false}
              onChange={(enabled) => handleToggleSetting('hideAuthorThumbnail', enabled)}
            />
          </div>
        </div>

        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Like/Dislike</div>
              <div className="text-xs text-text-secondary">Hide like and dislike buttons</div>
            </div>
            <ToggleSwitch
              checked={config?.youtubeDistraction?.hideSegmentedButtons || false}
              onChange={(enabled) => handleToggleSetting('hideSegmentedButtons', enabled)}
            />
          </div>
        </div>

        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Comment Section</div>
              <div className="text-xs text-text-secondary">Hide video description sections</div>
            </div>
            <ToggleSwitch
              checked={config?.youtubeDistraction?.hideSections || false}
              onChange={(enabled) => handleToggleSetting('hideSections', enabled)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderSearchPageSettings = () => (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Search Page"
        onNavigateBack={() => setCurrentSection('main')}
      />
      
      <div className="flex flex-col gap-md">
        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Video Grids</div>
              <div className="text-xs text-text-secondary">Hide video grids on search pages</div>
            </div>
            <ToggleSwitch
              checked={config?.youtubeDistraction?.hideGridShelf || false}
              onChange={(enabled) => handleToggleSetting('hideGridShelf', enabled)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  const renderGlobalSettings = () => (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Global"
        onNavigateBack={() => setCurrentSection('main')}
      />
      
      <div className="flex flex-col gap-md">
        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Header Bar</div>
              <div className="text-xs text-text-secondary">Hide YouTube header navigation</div>
            </div>
            <ToggleSwitch
              checked={config?.youtubeDistraction?.hideMasthead || false}
              onChange={(enabled) => handleToggleSetting('hideMasthead', enabled)}
            />
          </div>
        </div>

        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Mini Guide</div>
              <div className="text-xs text-text-secondary">Hide navigation sidebar</div>
            </div>
            <ToggleSwitch
              checked={config?.youtubeDistraction?.hideMiniGuide || false}
              onChange={(enabled) => handleToggleSetting('hideMiniGuide', enabled)}
            />
          </div>
        </div>

        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Start Elements</div>
              <div className="text-xs text-text-secondary">Hide start-related UI elements</div>
            </div>
            <ToggleSwitch
              checked={config?.youtubeDistraction?.hideStart || false}
              onChange={(enabled) => handleToggleSetting('hideStart', enabled)}
            />
          </div>
        </div>

        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">General Buttons</div>
              <div className="text-xs text-text-secondary">Hide miscellaneous button elements</div>
            </div>
            <ToggleSwitch
              checked={config?.youtubeDistraction?.hideButtons || false}
              onChange={(enabled) => handleToggleSetting('hideButtons', enabled)}
            />
          </div>
        </div>
      </div>
    </div>
  );

  switch (currentSection) {
    case 'main':
      return renderMainMenu();
    case 'video':
      return renderVideoPageSettings();
    case 'search':
      return renderSearchPageSettings();
    case 'global':
      return renderGlobalSettings();
    default:
      return renderMainMenu();
  }
};

export default ContentFocusSettings; 