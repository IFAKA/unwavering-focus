import { SearchQuery } from '../types';

export interface ISearchService {
  performSearch(query: string): Promise<void>;
  saveSearch(query: string): Promise<void>;
  deleteSearch(id: string): Promise<void>;
  clearAllSearches(): Promise<void>;
  getSavedSearches(): Promise<SearchQuery[]>;
  copyToClipboard(text: string): Promise<void>;
}

export class SearchService implements ISearchService {
  async performSearch(query: string): Promise<void> {
    try {
      // Check if the query is a URL
      if (this.isUrl(query)) {
        // Navigate directly to the URL
        await chrome.tabs.create({ url: query });
      } else {
        // Perform a Google Scholar search for academic content
        const searchUrl = `https://scholar.google.com/scholar?q=${encodeURIComponent(query)}`;
        await chrome.tabs.create({ url: searchUrl });
      }
    } catch (error) {
      console.error('Error performing search:', error);
      throw new Error('Failed to perform search');
    }
  }

  private isUrl(text: string): boolean {
    try {
      new URL(text);
      return true;
    } catch {
      return false;
    }
  }

  async saveSearch(query: string): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        type: 'SAVE_SEARCH',
        query: query
      });
    } catch (error) {
      console.error('Error saving search:', error);
      throw new Error('Failed to save search');
    }
  }

  async deleteSearch(id: string): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        type: 'DELETE_SEARCH',
        id: id
      });
    } catch (error) {
      console.error('Error deleting search:', error);
      throw new Error('Failed to delete search');
    }
  }

  async clearAllSearches(): Promise<void> {
    try {
      await chrome.runtime.sendMessage({
        type: 'CLEAR_ALL_SEARCHES'
      });
    } catch (error) {
      console.error('Error clearing all searches:', error);
      throw new Error('Failed to clear all searches');
    }
  }

  async getSavedSearches(): Promise<SearchQuery[]> {
    try {
      const response = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
      return response.savedSearches || [];
    } catch (error) {
      console.error('Error getting saved searches:', error);
      return [];
    }
  }

  async copyToClipboard(text: string): Promise<void> {
    try {
      await navigator.clipboard.writeText(text);
    } catch (error) {
      console.error('Error copying to clipboard:', error);
      throw new Error('Failed to copy to clipboard');
    }
  }
}

export const searchService = new SearchService(); 