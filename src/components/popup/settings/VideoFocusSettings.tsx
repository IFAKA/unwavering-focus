import React from 'react';
import { useConfig } from '../../../hooks/useConfig';
import SettingsHeader from '../../ui/SettingsHeader';
import ToggleSwitch from '../../ui/ToggleSwitch';

interface VideoFocusSettingsProps {
  onNavigateBack: () => void;
}

const VideoFocusSettings: React.FC<VideoFocusSettingsProps> = ({ onNavigateBack }) => {
  const { config, updateConfig } = useConfig();

  const handleToggleVideoFocus = (enabled: boolean) => {
    updateConfig('videoFocus.enabled', enabled);
  };

  const handleTogglePreventTabSwitch = (enabled: boolean) => {
    updateConfig('videoFocus.preventTabSwitch', enabled);
  };

  const handleToggleShowIndicator = (enabled: boolean) => {
    updateConfig('videoFocus.showIndicator', enabled);
  };

  const handleToggleAutoDetectVideos = (enabled: boolean) => {
    updateConfig('videoFocus.autoDetectVideos', enabled);
  };

  return (
    <div className="flex-1 overflow-y-auto p-md">
      <SettingsHeader
        title="Video Focus"
        onNavigateBack={onNavigateBack}
      />
      
      <div className="flex flex-col gap-md">
        <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
          <div className="flex items-center justify-between mb-sm">
            <div>
              <div className="text-md font-semibold text-text-primary">Video Focus Mode</div>
              <div className="text-xs text-text-secondary">Enable focus mode for videos</div>
            </div>
            <ToggleSwitch
              checked={config?.videoFocus?.enabled || false}
              onChange={handleToggleVideoFocus}
            />
          </div>
        </div>

        {config?.videoFocus?.enabled && (
          <>
            <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
              <div className="flex items-center justify-between mb-sm">
                <div>
                  <div className="text-md font-semibold text-text-primary">Prevent Tab Switching</div>
                  <div className="text-xs text-text-secondary">Keep focus on video content</div>
                </div>
                <ToggleSwitch
                  checked={config?.videoFocus?.preventTabSwitch || false}
                  onChange={handleTogglePreventTabSwitch}
                />
              </div>
            </div>

            <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
              <div className="flex items-center justify-between mb-sm">
                <div>
                  <div className="text-md font-semibold text-text-primary">Show Focus Indicator</div>
                  <div className="text-xs text-text-secondary">Display focus mode indicator</div>
                </div>
                <ToggleSwitch
                  checked={config?.videoFocus?.showIndicator || false}
                  onChange={handleToggleShowIndicator}
                />
              </div>
            </div>

            <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
              <div className="flex items-center justify-between mb-sm">
                <div>
                  <div className="text-md font-semibold text-text-primary">Auto-detect Videos</div>
                  <div className="text-xs text-text-secondary">Automatically detect video content</div>
                </div>
                <ToggleSwitch
                  checked={config?.videoFocus?.autoDetectVideos || false}
                  onChange={handleToggleAutoDetectVideos}
                />
              </div>
            </div>

            <div className="bg-bg-secondary rounded-apple p-md border border-bg-tertiary">
              <div className="mb-sm">
                <div className="text-md font-semibold text-text-primary">Supported Platforms</div>
                <div className="text-xs text-text-secondary">
                  YouTube, Netflix, Vimeo, Twitch, Facebook, Instagram, TikTok
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default VideoFocusSettings; 