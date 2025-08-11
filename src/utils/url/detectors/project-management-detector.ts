/**
 * Detects Jira URLs
 */
export function isJiraUrl(url: string): { isMatch: boolean; ticketId?: string } {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;
    
    if (hostname.includes('atlassian.net') || hostname.includes('jira.com')) {
      const ticketMatch = pathname.match(/\/([A-Z]+-\d+)/);
      return { isMatch: true, ticketId: ticketMatch?.[1] };
    }
    
    return { isMatch: false };
  } catch {
    return { isMatch: false };
  }
}

/**
 * Detects Confluence URLs
 */
export function isConfluenceUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;
    
    return hostname.includes('atlassian.net') && pathname.includes('/wiki/');
  } catch {
    return false;
  }
}

/**
 * Detects Linear URLs
 */
export function isLinearUrl(url: string): { isMatch: boolean; ticketId?: string } {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;
    
    if (hostname.includes('linear.app')) {
      const ticketMatch = pathname.match(/\/([A-Z]+-\d+)/);
      return { isMatch: true, ticketId: ticketMatch?.[1] };
    }
    
    return { isMatch: false };
  } catch {
    return { isMatch: false };
  }
}

/**
 * Detects Asana URLs
 */
export function isAsanaUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('app.asana.com');
  } catch {
    return false;
  }
}

/**
 * Detects Trello URLs
 */
export function isTrelloUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    
    return hostname.includes('trello.com');
  } catch {
    return false;
  }
}
