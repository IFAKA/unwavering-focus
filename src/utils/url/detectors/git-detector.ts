/**
 * Detects GitLab Merge Requests
 */
export function isGitLabMergeRequest(url: string): { isMatch: boolean; mrId?: string } {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;
    
    if (hostname.includes('gitlab.com') && pathname.includes('/-/merge_requests/')) {
      const mrId = pathname.match(/\/merge_requests\/(\d+)/)?.[1];
      return { isMatch: true, mrId };
    }
    
    return { isMatch: false };
  } catch {
    return { isMatch: false };
  }
}

/**
 * Detects GitHub Pull Requests
 */
export function isGitHubPullRequest(url: string): { isMatch: boolean; prId?: string } {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;
    
    if (hostname.includes('github.com') && pathname.includes('/pull/')) {
      const prId = pathname.match(/\/pull\/(\d+)/)?.[1];
      return { isMatch: true, prId };
    }
    
    return { isMatch: false };
  } catch {
    return { isMatch: false };
  }
}

/**
 * Detects GitHub Issues
 */
export function isGitHubIssue(url: string): { isMatch: boolean; issueId?: string } {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;
    
    if (hostname.includes('github.com') && pathname.includes('/issues/')) {
      const issueId = pathname.match(/\/issues\/(\d+)/)?.[1];
      return { isMatch: true, issueId };
    }
    
    return { isMatch: false };
  } catch {
    return { isMatch: false };
  }
}

/**
 * Detects GitLab Issues
 */
export function isGitLabIssue(url: string): { isMatch: boolean; issueId?: string } {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;
    
    if (hostname.includes('gitlab.com') && pathname.includes('/-/issues/')) {
      const issueId = pathname.match(/\/issues\/(\d+)/)?.[1];
      return { isMatch: true, issueId };
    }
    
    return { isMatch: false };
  } catch {
    return { isMatch: false };
  }
}
