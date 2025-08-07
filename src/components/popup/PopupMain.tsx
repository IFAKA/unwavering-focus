import React, { useState, useEffect } from 'react';
import { SearchQuery } from '../../types';
import { useSearch } from '../../hooks/useSearch';
import { useConfig } from '../../hooks/useConfig';
import AppleWatchStatusBar from '../ui/AppleWatchStatusBar';
import AppleWatchButton from '../ui/AppleWatchButton';
import AppleWatchIcon from '../ui/AppleWatchIcon';
import MetricsRow from '../metrics/MetricsRow';
import SearchList from '../search/SearchList';
import { searchService } from '../../services/SearchService';

interface PopupMainProps {
  onNavigateToSettings: () => void;
}

const PopupMain: React.FC<PopupMainProps> = ({ onNavigateToSettings }) => {
  const { config, loading, getFeatureStatus } = useConfig();
  const { searchStatus, searchingQuery, copyStatus, performSearch, copySearchQuery, deleteSearch } = useSearch();
  
  const [savedSearches, setSavedSearches] = useState<SearchQuery[]>([]);
  const [tabCount, setTabCount] = useState(0);
  const [countdown, setCountdown] = useState<string>('--:--');
  const [eyeCareStatus, setEyeCareStatus] = useState<'enabled' | 'disabled'>('disabled');
  const [tabLimiterStatus, setTabLimiterStatus] = useState<'enabled' | 'disabled'>('disabled');

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
      setEyeCareStatus(eyeCare);
      setTabLimiterStatus(tabLimiter);
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

  const handleNewSearch = () => {
    chrome.tabs.create({ url: 'https://www.google.com/search?q=' + encodeURIComponent('') });
  };

  const handleFocusMode = () => {
    chrome.tabs.create({ url: chrome.runtime.getURL('focus-page.html') });
  };

  const handleSearch = async (query: SearchQuery) => {
    await performSearch(query);
    // Reload searches after performing search
    const searches = await searchService.getSavedSearches();
    setSavedSearches(searches);
  };

  const handleCopy = async (text: string) => {
    await copySearchQuery(text);
  };

  const handleDelete = async (id: string) => {
    await deleteSearch(id);
    // Reload searches after deletion
    const searches = await searchService.getSavedSearches();
    setSavedSearches(searches);
  };

  if (loading) {
    return <div className="flex items-center justify-center h-full">Loading...</div>;
  }

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
        onSavedItemsClick={onNavigateToSettings}
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

      {/* Quick Actions */}
      <div className="p-lg flex flex-col gap-md">
        <div className="flex gap-sm">
          <AppleWatchButton
            variant="primary"
            size="medium"
            icon={<AppleWatchIcon name="search" size="sm" />}
            onClick={handleNewSearch}
            className="flex-1"
          >
            Search All
          </AppleWatchButton>
          
          <AppleWatchButton
            variant="secondary"
            size="medium"
            icon={<AppleWatchIcon name="settings" size="sm" />}
            onClick={onNavigateToSettings}
            className="flex-1"
          >
            Settings
          </AppleWatchButton>
        </div>
        
        <AppleWatchButton
          variant="success"
          size="medium"
          icon={<AppleWatchIcon name="focus" size="sm" />}
          onClick={handleFocusMode}
          className="w-full"
        >
          Focus Mode
        </AppleWatchButton>
      </div>
    </>
  );
};

export default PopupMain; 