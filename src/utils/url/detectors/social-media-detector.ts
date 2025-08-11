/**
 * Detects YouTube URLs
 */
export function isYouTubeUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('youtube.com') || hostname.includes('youtu.be');
  } catch {
    return false;
  }
}

/**
 * Detects Reddit URLs
 */
export function isRedditUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('reddit.com');
  } catch {
    return false;
  }
}

/**
 * Detects Twitter/X URLs
 */
export function isTwitterUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('twitter.com') || hostname.includes('x.com');
  } catch {
    return false;
  }
}

/**
 * Detects LinkedIn URLs
 */
export function isLinkedInUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('linkedin.com');
  } catch {
    return false;
  }
}

/**
 * Detects Slack URLs
 */
export function isSlackUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('slack.com');
  } catch {
    return false;
  }
}

/**
 * Detects Discord URLs
 */
export function isDiscordUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('discord.com');
  } catch {
    return false;
  }
}
