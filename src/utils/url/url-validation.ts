import { UrlValidationResult, DomainInfo } from './url-types';

/**
 * Extracts domain from URL
 */
export function extractDomain(url: string): string {
  try {
    const urlObj = new URL(url);
    return urlObj.hostname.toLowerCase();
  } catch {
    return '';
  }
}

/**
 * Checks if URL is a homepage
 */
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

/**
 * Checks if URL contains specific content
 */
export function isSpecificContent(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const path = urlObj.pathname;
    const search = urlObj.search;
    
    // Check for specific content patterns
    const contentPatterns = [
      /\/watch\?/, // YouTube videos
      /\/results\?/, // Search results
      /\/r\/[^/]+\/comments\//, // Reddit comments
      /\/status\//, // Twitter/X posts
      /\/posts\//, // Facebook posts
      /\/videos\//, // Video content
      /\/search\?/, // Search pages
      /\/@[^/]+/, // User profiles
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

/**
 * Checks if domain is distracting
 */
export function isDistractingDomain(url: string, distractingDomains: string[]): boolean {
  const domain = extractDomain(url);
  return distractingDomains.some(distractingDomain => 
    domain === distractingDomain || domain.endsWith(`.${distractingDomain}`)
  );
}

/**
 * Determines if URL should be redirected
 */
export function shouldRedirect(url: string, distractingDomains: string[]): boolean {
  const domain = extractDomain(url);
  const isDistracting = distractingDomains.some(distractingDomain => 
    domain === distractingDomain || domain.endsWith(`.${distractingDomain}`)
  );
  
  return isDistracting && isHomepage(url) && !isSpecificContent(url);
}

/**
 * Validates if text is a URL
 */
export function isUrl(text: string): boolean {
  // Check if the entire text is a URL (not just contains a URL)
  const urlPattern = /^https?:\/\/[^\s]+$/;
  return urlPattern.test(text.trim());
}

/**
 * Validates URL format
 */
export function validateUrl(url: string): UrlValidationResult {
  try {
    const urlObj = new URL(url);
    return {
      isValid: true,
      normalizedUrl: urlObj.href
    };
  } catch (error) {
    return {
      isValid: false,
      error: error instanceof Error ? error.message : 'Invalid URL format'
    };
  }
}

/**
 * Gets comprehensive domain information
 */
export function getDomainInfo(url: string, distractingDomains: string[]): DomainInfo {
  const domain = extractDomain(url);
  const isDistracting = isDistractingDomain(url, distractingDomains);
  const isHomepageUrl = isHomepage(url);
  const isSpecificContentUrl = isSpecificContent(url);
  const shouldRedirectUrl = shouldRedirect(url, distractingDomains);
  
  return {
    domain,
    isDistracting,
    isHomepage: isHomepageUrl,
    isSpecificContent: isSpecificContentUrl,
    shouldRedirect: shouldRedirectUrl
  };
}

/**
 * Normalizes URL for comparison
 */
export function normalizeUrl(url: string): string {
  try {
    const urlObj = new URL(url);
    // Remove trailing slash and normalize protocol
    return urlObj.href.replace(/\/$/, '');
  } catch {
    return url;
  }
}

/**
 * Checks if two URLs point to the same resource
 */
export function areUrlsEquivalent(url1: string, url2: string): boolean {
  try {
    const normalized1 = normalizeUrl(url1);
    const normalized2 = normalizeUrl(url2);
    return normalized1 === normalized2;
  } catch {
    return false;
  }
}

/**
 * Formats URL for display purposes
 */
export function formatUrlForDisplay(url: string): string {
  try {
    const urlObj = new URL(url);
    let displayText = urlObj.hostname;
    
    // Remove www. prefix for cleaner display
    if (displayText.startsWith('www.')) {
      displayText = displayText.slice(4);
    }
    
    // Add path if it's not just the homepage
    if (urlObj.pathname && urlObj.pathname !== '/' && urlObj.pathname !== '/index.html') {
      displayText += urlObj.pathname;
    }
    
    // Add query parameters if they exist and are meaningful
    if (urlObj.search && urlObj.search.length > 1) {
      // Limit query display to first 50 characters
      const queryDisplay = urlObj.search.length > 50 
        ? urlObj.search.substring(0, 50) + '...'
        : urlObj.search;
      displayText += queryDisplay;
    }
    
    return displayText;
  } catch {
    // If URL parsing fails, return the original string truncated
    return url.length > 50 ? url.substring(0, 50) + '...' : url;
  }
}
