import React, { useState, useEffect } from 'react';
import { SearchQuery } from '../../types';
import { useSearch } from '../../hooks/useSearch';
import { useConfig } from '../../hooks/useConfig';
import AppleWatchStatusBar from '../ui/AppleWatchStatusBar';
import AppleWatchIcon from '../ui/AppleWatchIcon';
import MetricsRow from '../metrics/MetricsRow';
import SearchList from '../search/SearchList';
import { searchService } from '../../services/SearchService';

interface PopupMainProps {
  onNavigateToSettings: () => void;
}

const PopupMain: React.FC<PopupMainProps> = ({ onNavigateToSettings }) => {
  const { config, getFeatureStatus, updateConfig } = useConfig();
  const { 
    searchStatus, 
    searchingQuery, 
    copyStatus, 
    performSearch, 
    copySearchQuery, 
    deleteSearch
  } = useSearch();
  
  const [savedSearches, setSavedSearches] = useState<SearchQuery[]>([]);
  const [tabCount, setTabCount] = useState(0);
  const [countdown, setCountdown] = useState<string>('--:--');
  const [eyeCareStatus, setEyeCareStatus] = useState<'enabled' | 'disabled'>('disabled');
  const [tabLimiterStatus, setTabLimiterStatus] = useState<'enabled' | 'disabled'>('disabled');
  const [featureStatuses, setFeatureStatuses] = useState<Record<string, 'enabled' | 'disabled'>>({});

  // Load saved searches
  useEffect(() => {
    const loadSearches = async () => {
      const searches = await searchService.getSavedSearches();
      setSavedSearches(searches);
    };
    loadSearches();
  }, []);

  // Load tab count
  useEffect(() => {
    const loadTabCount = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
        setTabCount(response.tabCount || 0);
      } catch (error) {
        console.error('Error loading tab count:', error);
      }
    };
    loadTabCount();
  }, []);

  // Load feature statuses
  useEffect(() => {
    const loadFeatureStatuses = async () => {
      const eyeCare = await getFeatureStatus('eyeCare');
      const tabLimiter = await getFeatureStatus('tabLimiter');
      const smartSearch = await getFeatureStatus('smartSearch');
      const habits = await getFeatureStatus('habits');
      const pillars = await getFeatureStatus('pillars');
      const blocker = await getFeatureStatus('blocker');
      const videoFocus = await getFeatureStatus('videoFocus');
      const contentFocus = await getFeatureStatus('contentFocus');
      
      setEyeCareStatus(eyeCare);
      setTabLimiterStatus(tabLimiter);
      setFeatureStatuses({
        eyeCare,
        tabLimiter,
        smartSearch,
        habits,
        pillars,
        blocker,
        videoFocus,
        contentFocus
      });
    };
    loadFeatureStatuses();
  }, [getFeatureStatus]);

  // Countdown timer for eye care
  useEffect(() => {
    const updateCountdown = async () => {
      try {
        const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
        const { config: configData, nextEyeCareAlarm } = response;
        
        if (configData?.eyeCare?.enabled && nextEyeCareAlarm) {
          const now = Date.now();
          const timeUntilAlarm = nextEyeCareAlarm - now;
          
          if (timeUntilAlarm <= 0) {
            const timeSinceAlarm = Math.abs(timeUntilAlarm);
            if (timeSinceAlarm <= 20000) {
              const remainingSeconds = Math.max(0, Math.ceil((20000 - timeSinceAlarm) / 1000));
              setCountdown(`${remainingSeconds}s`);
            } else {
              const nextAlarm = nextEyeCareAlarm + (20 * 60 * 1000);
              const timeUntilNext = nextAlarm - now;
              const minutes = Math.max(0, Math.floor(timeUntilNext / 60000));
              const seconds = Math.max(0, Math.floor((timeUntilNext % 60000) / 1000));
              setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
            }
          } else {
            const minutes = Math.max(0, Math.floor(timeUntilAlarm / 60000));
            const seconds = Math.max(0, Math.floor((timeUntilAlarm % 60000) / 1000));
            setCountdown(`${minutes}:${seconds.toString().padStart(2, '0')}`);
          }
        }
      } catch (error) {
        console.error('Error updating countdown:', error);
      }
    };

    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = async (query: SearchQuery) => {
    try {
      await performSearch(query);
    } catch (error) {
      console.error('Search error:', error);
    }
  };

  const handleCopy = async (text: string) => {
    try {
      await copySearchQuery(text);
    } catch (error) {
      console.error('Copy error:', error);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await deleteSearch(id);
      // Reload searches after deletion
      const searches = await searchService.getSavedSearches();
      setSavedSearches(searches);
    } catch (error) {
      console.error('Delete error:', error);
    }
  };

  const handleFocusMode = () => {
    // Navigate to focus page
    chrome.tabs.create({ url: chrome.runtime.getURL('focus-page.html') });
  };

  const handleFeatureClick = () => {
    // Navigate to settings for the specific feature
    onNavigateToSettings();
  };

  const handleFeatureToggle = async (feature: string) => {
    try {
      const currentStatus = featureStatuses[feature];
      const newStatus = currentStatus === 'enabled' ? 'disabled' : 'enabled';
      
      // Update the feature status in config
      switch (feature) {
        case 'eyeCare':
          await updateConfig('eyeCare.enabled', newStatus === 'enabled');
          break;
        case 'tabLimiter':
          await updateConfig('tabLimiter.enabled', newStatus === 'enabled');
          break;
        case 'smartSearch':
          await updateConfig('smartSearch.enabled', newStatus === 'enabled');
          break;
        case 'blocker':
          await updateConfig('distractionBlocker.enabled', newStatus === 'enabled');
          break;
        case 'videoFocus':
          await updateConfig('videoFocus.enabled', newStatus === 'enabled');
          break;
        case 'habits':
          // For habits, we need to check if there are any habits configured
          if (newStatus === 'enabled') {
            // Navigate to settings to configure habits
            onNavigateToSettings();
            return;
          }
          break;
        case 'pillars':
          // For pillars, we need to check if there are any pillars configured
          if (newStatus === 'enabled') {
            // Navigate to settings to configure pillars
            onNavigateToSettings();
            return;
          }
          break;
      }
      
      // Reload feature statuses after update
      const loadFeatureStatuses = async () => {
        const eyeCare = await getFeatureStatus('eyeCare');
        const tabLimiter = await getFeatureStatus('tabLimiter');
        const smartSearch = await getFeatureStatus('smartSearch');
        const habits = await getFeatureStatus('habits');
        const pillars = await getFeatureStatus('pillars');
        const blocker = await getFeatureStatus('blocker');
        const videoFocus = await getFeatureStatus('videoFocus');
        const contentFocus = await getFeatureStatus('contentFocus');
        
        setEyeCareStatus(eyeCare);
        setTabLimiterStatus(tabLimiter);
        setFeatureStatuses({
          eyeCare,
          tabLimiter,
          smartSearch,
          habits,
          pillars,
          blocker,
          videoFocus,
          contentFocus
        });
      };
      loadFeatureStatuses();
    } catch (error) {
      console.error('Error toggling feature:', error);
    }
  };

  return (
    <>
      {/* Search Status Feedback */}
      {searchStatus !== 'idle' && (
        <AppleWatchStatusBar
          type={searchStatus === 'searching' ? 'searching' : searchStatus === 'completed' ? 'completed' : 'error'}
          message={searchStatus === 'searching' ? 'Searching...' : searchStatus === 'completed' ? 'Completed' : 'Error occurred'}
          subtitle={searchingQuery}
        />
      )}

      {/* Metrics Row */}
      <MetricsRow
        eyeCareCountdown={countdown}
        tabCount={tabCount}
        maxTabs={config?.tabLimiter?.maxTabs || 3}
        eyeCareStatus={eyeCareStatus}
        tabLimiterStatus={tabLimiterStatus}
        onEyeCareClick={handleFeatureClick}
        onTabLimiterClick={handleFeatureClick}
        onFocusModeClick={handleFocusMode}
        onSettingsClick={onNavigateToSettings}
      />

      {/* Search List */}
      <SearchList
        searches={savedSearches}
        onSearch={handleSearch}
        onCopy={handleCopy}
        onDelete={handleDelete}
        copyStatus={copyStatus}
      />

      {/* Footer with Feature Toggle Buttons - Apple Watch Style */}
      <div className="p-md ds-border-top">
        <div className="ds-flex-center gap-sm">
          {/* Eye Care */}
          <button
            onClick={() => handleFeatureToggle('eyeCare')}
            className={`ds-button ds-button-small rounded-full transition-all duration-200 ${
              eyeCareStatus === 'enabled' 
                ? 'bg-accent-primary text-white shadow-sm' 
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
            }`}
            title={`Eye Care: ${eyeCareStatus} (Click to toggle)`}
          >
            <AppleWatchIcon 
              name="eye" 
              size="sm" 
              color={eyeCareStatus === 'enabled' ? '#ffffff' : '#8e8e93'} 
            />
          </button>
          
          {/* Tab Limiter */}
          <button
            onClick={() => handleFeatureToggle('tabLimiter')}
            className={`ds-button ds-button-small rounded-full transition-all duration-200 ${
              tabLimiterStatus === 'enabled' 
                ? 'bg-accent-primary text-white shadow-sm' 
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
            }`}
            title={`Tab Limiter: ${tabLimiterStatus} (Click to toggle)`}
          >
            <AppleWatchIcon 
              name="tabs" 
              size="sm" 
              color={tabLimiterStatus === 'enabled' ? '#ffffff' : '#8e8e93'} 
            />
          </button>
          
          {/* Smart Search */}
          <button
            onClick={() => handleFeatureToggle('smartSearch')}
            className={`ds-button ds-button-small rounded-full transition-all duration-200 ${
              featureStatuses.smartSearch === 'enabled' 
                ? 'bg-accent-primary text-white shadow-sm' 
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
            }`}
            title={`Smart Search: ${featureStatuses.smartSearch || 'disabled'} (Click to toggle)`}
          >
            <AppleWatchIcon 
              name="search" 
              size="sm" 
              color={featureStatuses.smartSearch === 'enabled' ? '#ffffff' : '#8e8e93'} 
            />
          </button>
          
          {/* Distraction Blocker */}
          <button
            onClick={() => handleFeatureToggle('blocker')}
            className={`ds-button ds-button-small rounded-full transition-all duration-200 ${
              featureStatuses.blocker === 'enabled' 
                ? 'bg-accent-primary text-white shadow-sm' 
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
            }`}
            title={`Distraction Blocker: ${featureStatuses.blocker || 'disabled'} (Click to toggle)`}
          >
            <AppleWatchIcon 
              name="ban" 
              size="sm" 
              color={featureStatuses.blocker === 'enabled' ? '#ffffff' : '#8e8e93'} 
            />
          </button>
          
          {/* Video Focus */}
          <button
            onClick={() => handleFeatureToggle('videoFocus')}
            className={`ds-button ds-button-small rounded-full transition-all duration-200 ${
              featureStatuses.videoFocus === 'enabled' 
                ? 'bg-accent-primary text-white shadow-sm' 
                : 'bg-bg-tertiary text-text-secondary hover:bg-bg-secondary'
            }`}
            title={`Video Focus: ${featureStatuses.videoFocus || 'disabled'} (Click to toggle)`}
          >
            <AppleWatchIcon 
              name="video" 
              size="sm" 
              color={featureStatuses.videoFocus === 'enabled' ? '#ffffff' : '#8e8e93'} 
            />
          </button>
        </div>
      </div>
    </>
  );
};

export default PopupMain; 