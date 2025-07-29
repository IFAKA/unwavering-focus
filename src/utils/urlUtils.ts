export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return '';
  }
}

export function isHomepage(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    
    // Consider homepage if path is empty, just "/", or contains only basic paths
    const homepagePatterns = [
      /^\/?$/,
      /^\/home\/?$/,
      /^\/index\.html?$/,
      /^\/main\/?$/
    ];
    
    return homepagePatterns.some(pattern => pattern.test(path));
  } catch {
    return false;
  }
}

export function isSpecificContent(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const search = urlObj.search;
    
    // Check for specific content patterns
    const contentPatterns = [
      /\/watch\?/, // YouTube videos
      /\/results\?/, // Search results
      /\/r\/[^\/]+\/comments\//, // Reddit comments
      /\/status\//, // Twitter/X posts
      /\/posts\//, // Facebook posts
      /\/videos\//, // Video content
      /\/search\?/, // Search pages
      /\/@[^\/]+/, // User profiles
      /\/user\//, // User pages
      /\/channel\//, // YouTube channels
      /\/c\//, // YouTube custom URLs
      /\/playlist\?/, // YouTube playlists
    ];
    
    return contentPatterns.some(pattern => 
      pattern.test(path) || pattern.test(search)
    );
  } catch {
    return false;
  }
}

export function isDistractingDomain(url: string, distractingDomains: string[]): boolean {
  const domain = extractDomain(url);
  return distractingDomains.some(distractingDomain => 
    domain === distractingDomain || domain.endsWith(`.${distractingDomain}`)
  );
}

export function shouldRedirect(url: string, distractingDomains: string[]): boolean {
  const domain = extractDomain(url);
  const isDistracting = distractingDomains.some(distractingDomain => 
    domain === distractingDomain || domain.endsWith(`.${distractingDomain}`)
  );
  
  return isDistracting && isHomepage(url) && !isSpecificContent(url);
}

export function getSearchUrl(query: string, searchEngine: string = 'google'): string {
  const searchEngines = {
    google: `https://www.google.com/search?q=${encodeURIComponent(query)}`,
    bing: `https://www.bing.com/search?q=${encodeURIComponent(query)}`,
    duckduckgo: `https://duckduckgo.com/?q=${encodeURIComponent(query)}`,
    yahoo: `https://search.yahoo.com/search?p=${encodeURIComponent(query)}`
  };
  
  return searchEngines[searchEngine as keyof typeof searchEngines] || searchEngines.google;
} 