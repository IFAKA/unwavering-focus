/**
 * Detects Notion URLs
 */
export function isNotionUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('notion.so');
  } catch {
    return false;
  }
}

/**
 * Detects Figma URLs
 */
export function isFigmaUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('figma.com');
  } catch {
    return false;
  }
}

/**
 * Detects Medium URLs
 */
export function isMediumUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('medium.com');
  } catch {
    return false;
  }
}

/**
 * Detects Dev.to URLs
 */
export function isDevToUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('dev.to');
  } catch {
    return false;
  }
}

/**
 * Detects Hacker News URLs
 */
export function isHackerNewsUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('news.ycombinator.com');
  } catch {
    return false;
  }
}

/**
 * Detects Stack Overflow URLs
 */
export function isStackOverflowUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('stackoverflow.com');
  } catch {
    return false;
  }
}
