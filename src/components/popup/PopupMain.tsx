import React, { useState, useEffect } from 'react';
import { SearchQuery } from '../../types';
import { useSearch } from '../../hooks/useSearch';
import { useConfig } from '../../hooks/useConfig';
import AppleWatchStatusBar from '../ui/AppleWatchStatusBar';
import MetricsRow from '../metrics/MetricsRow';
import SearchList from '../search/SearchList';
import { searchService } from '../../services/SearchService';
import FeatureToggleButtons from './FeatureToggleButtons';

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
      const blocker = await getFeatureStatus('blocker');
      const videoFocus = await getFeatureStatus('videoFocus');
      const contentFocus = await getFeatureStatus('contentFocus');
      
      setEyeCareStatus(eyeCare);
      setTabLimiterStatus(tabLimiter);
      setFeatureStatuses({
        eyeCare,
        tabLimiter,
        smartSearch,
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
        case 'contentFocus':
          await updateConfig('videoFocus.enabled', newStatus === 'enabled');
          break;
      }
      
      // Reload feature statuses after update
      const loadFeatureStatuses = async () => {
        const eyeCare = await getFeatureStatus('eyeCare');
        const tabLimiter = await getFeatureStatus('tabLimiter');
        const smartSearch = await getFeatureStatus('smartSearch');
        const blocker = await getFeatureStatus('blocker');
        const videoFocus = await getFeatureStatus('videoFocus');
        const contentFocus = await getFeatureStatus('contentFocus');
        
        setEyeCareStatus(eyeCare);
        setTabLimiterStatus(tabLimiter);
        setFeatureStatuses({
          eyeCare,
          tabLimiter,
          smartSearch,
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

      {/* Feature Toggle Buttons */}
      <FeatureToggleButtons
        featureStatuses={featureStatuses}
        onFeatureToggle={handleFeatureToggle}
      />
    </>
  );
};

export default PopupMain; 