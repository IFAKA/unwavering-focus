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
  const { config, getFeatureStatus } = useConfig();
  const { 
    searchStatus, 
    searchingQuery, 
    copyStatus, 
    performSearch, 
    copySearchQuery, 
    deleteSearch,
    setSearchStatus,
    setSearchingQuery
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
    setSearchingQuery(query.query);
    setSearchStatus('searching');
    
    try {
      await performSearch(query);
      setSearchStatus('completed');
    } catch (error) {
      console.error('Search error:', error);
      setSearchStatus('error');
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
        savedSearchesCount={savedSearches.length}
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

      {/* Footer with Feature Status Icons */}
      <div className="p-md border-t border-bg-tertiary">
        <div className="flex justify-center gap-lg">
          {/* Eye Care */}
          <div className="p-sm rounded-full bg-bg-secondary" title={`Eye Care: ${eyeCareStatus}`}>
            <AppleWatchIcon 
              name="eye" 
              size="sm" 
              color={eyeCareStatus === 'enabled' ? '#34c759' : '#8e8e93'} 
            />
          </div>
          
          {/* Tab Limiter */}
          <div className="p-sm rounded-full bg-bg-secondary" title={`Tab Limiter: ${tabLimiterStatus}`}>
            <AppleWatchIcon 
              name="tabs" 
              size="sm" 
              color={tabLimiterStatus === 'enabled' ? '#34c759' : '#8e8e93'} 
            />
          </div>
          
          {/* Smart Search */}
          <div className="p-sm rounded-full bg-bg-secondary" title={`Smart Search: ${featureStatuses.smartSearch || 'disabled'}`}>
            <AppleWatchIcon 
              name="search" 
              size="sm" 
              color={featureStatuses.smartSearch === 'enabled' ? '#34c759' : '#8e8e93'} 
            />
          </div>
          
          {/* Distraction Blocker */}
          <div className="p-sm rounded-full bg-bg-secondary" title={`Distraction Blocker: ${featureStatuses.blocker || 'disabled'}`}>
            <AppleWatchIcon 
              name="ban" 
              size="sm" 
              color={featureStatuses.blocker === 'enabled' ? '#34c759' : '#8e8e93'} 
            />
          </div>
          
          {/* Video Focus */}
          <div className="p-sm rounded-full bg-bg-secondary" title={`Video Focus: ${featureStatuses.videoFocus || 'disabled'}`}>
            <AppleWatchIcon 
              name="video" 
              size="sm" 
              color={featureStatuses.videoFocus === 'enabled' ? '#34c759' : '#8e8e93'} 
            />
          </div>
          
          {/* Habits */}
          <div className="p-sm rounded-full bg-bg-secondary" title={`Habits: ${featureStatuses.habits || 'disabled'}`}>
            <AppleWatchIcon 
              name="check" 
              size="sm" 
              color={featureStatuses.habits === 'enabled' ? '#34c759' : '#8e8e93'} 
            />
          </div>
          
          {/* Pillars */}
          <div className="p-sm rounded-full bg-bg-secondary" title={`Pillars: ${featureStatuses.pillars || 'disabled'}`}>
            <AppleWatchIcon 
              name="star" 
              size="sm" 
              color={featureStatuses.pillars === 'enabled' ? '#34c759' : '#8e8e93'} 
            />
          </div>
        </div>
      </div>
    </>
  );
};

export default PopupMain; 