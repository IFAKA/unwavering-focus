import { useState, useCallback } from 'react';
import { SearchQuery } from '../types';
import { searchService } from '../services/SearchService';

export const useSearch = () => {
  const [searchStatus, setSearchStatus] = useState<
    'idle' | 'searching' | 'completed' | 'error'
  >('idle');
  const [searchingQuery, setSearchingQuery] = useState<string>('');
  const [copyStatus, setCopyStatus] = useState<'idle' | 'copied'>('idle');

  const performSearch = useCallback(async (query: SearchQuery) => {
    try {
      setSearchStatus('searching');
      setSearchingQuery(query.query);

      // Delete the search item first
      await searchService.deleteSearch(query.id);

      // Then perform the search
      await searchService.performSearch(query.query);

      setSearchStatus('completed');
      setTimeout(() => setSearchStatus('idle'), 2000);
    } catch (error) {
      console.error('Error performing search:', error);
      setSearchStatus('error');
      setTimeout(() => setSearchStatus('idle'), 3000);
    }
  }, []);

  const copySearchQuery = useCallback(async (query: string) => {
    try {
      await searchService.copyToClipboard(query);
      setCopyStatus('copied');
      setTimeout(() => setCopyStatus('idle'), 800);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
    }
  }, []);

  const deleteSearch = useCallback(async (id: string) => {
    try {
      await searchService.deleteSearch(id);
    } catch (error) {
      console.error('Error deleting search:', error);
    }
  }, []);

  return {
    searchStatus,
    searchingQuery,
    copyStatus,
    performSearch,
    copySearchQuery,
    deleteSearch,
  };
};
