import { SearchEngine } from './url-types';

/**
 * Gets search URL for a query
 */
export function getSearchUrl(query: string, searchEngine: string = 'google'): string {
  const searchEngines: Record<string, SearchEngine> = {
    google: {
      name: 'Google',
      url: 'https://www.google.com/search',
      queryParam: 'q'
    },
    bing: {
      name: 'Bing',
      url: 'https://www.bing.com/search',
      queryParam: 'q'
    },
    duckduckgo: {
      name: 'DuckDuckGo',
      url: 'https://duckduckgo.com/',
      queryParam: 'q'
    },
    yahoo: {
      name: 'Yahoo',
      url: 'https://search.yahoo.com/search',
      queryParam: 'p'
    }
  };
  
  const engine = searchEngines[searchEngine] || searchEngines.google;
  const url = new URL(engine.url);
  url.searchParams.set(engine.queryParam, query);
  
  return url.toString();
}

/**
 * Gets available search engines
 */
export function getAvailableSearchEngines(): SearchEngine[] {
  return [
    {
      name: 'Google',
      url: 'https://www.google.com/search',
      queryParam: 'q'
    },
    {
      name: 'Bing',
      url: 'https://www.bing.com/search',
      queryParam: 'q'
    },
    {
      name: 'DuckDuckGo',
      url: 'https://duckduckgo.com/',
      queryParam: 'q'
    },
    {
      name: 'Yahoo',
      url: 'https://search.yahoo.com/search',
      queryParam: 'p'
    }
  ];
}

/**
 * Extracts search query from search engine URL
 */
export function extractSearchQuery(url: string): string | null {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    // Check different search engines
    if (hostname.includes('google')) {
      return urlObj.searchParams.get('q');
    } else if (hostname.includes('bing')) {
      return urlObj.searchParams.get('q');
    } else if (hostname.includes('duckduckgo')) {
      return urlObj.searchParams.get('q');
    } else if (hostname.includes('yahoo')) {
      return urlObj.searchParams.get('p');
    }
    
    return null;
  } catch {
    return null;
  }
}

/**
 * Checks if URL is a search engine result
 */
export function isSearchEngineResult(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    const searchEngines = [
      'google.com',
      'bing.com',
      'duckduckgo.com',
      'search.yahoo.com'
    ];
    
    return searchEngines.some(engine => hostname.includes(engine));
  } catch {
    return false;
  }
}
