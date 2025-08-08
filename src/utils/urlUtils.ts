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

// URL detection and formatting utilities
export function isUrl(text: string): boolean {
  // Check if the entire text is a URL (not just contains a URL)
  const urlPattern = /^https?:\/\/[^\s]+$/;
  return urlPattern.test(text.trim());
}

export function formatUrlForDisplay(url: string): string {
  // Remove protocol
  let formatted = url.replace(/^https?:\/\//, '');
  
  // Remove www subdomain
  formatted = formatted.replace(/^www\./, '');
  
  // Remove trailing slash
  formatted = formatted.replace(/\/$/, '');
  
  return formatted;
}

// Enhanced URL type detection for specialized styling
export interface UrlTypeInfo {
  type: 'merge-request' | 'pull-request' | 'jira-ticket' | 'confluence-page' | 'stackoverflow' | 'github-issue' | 'gitlab-issue' | 'notion-page' | 'figma-design' | 'linear-ticket' | 'asana-task' | 'trello-card' | 'slack-channel' | 'discord-channel' | 'youtube-video' | 'medium-article' | 'dev-post' | 'hackernews' | 'reddit-post' | 'twitter-post' | 'linkedin-post' | 'documentation' | 'api-docs' | 'npm-package' | 'docker-hub' | 'kubernetes-docs' | 'aws-docs' | 'google-cloud' | 'azure-docs' | 'databricks' | 'snowflake' | 'tableau' | 'powerbi' | 'jupyter-notebook' | 'kaggle' | 'leetcode' | 'hackerrank' | 'codewars' | 'udemy' | 'coursera' | 'edx' | 'other';
  platform: string;
  identifier?: string;
  title?: string;
  color: string;
  icon: string;
  description: string;
}

export function detectUrlType(url: string): UrlTypeInfo {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;
    const search = urlObj.search;

    // GitLab Merge Requests
    if (hostname.includes('gitlab.com') && pathname.includes('/-/merge_requests/')) {
      const mrId = pathname.match(/\/merge_requests\/(\d+)/)?.[1];
      return {
        type: 'merge-request',
        platform: 'GitLab',
        identifier: mrId,
        color: '#FC6D26',
        icon: 'git-branch',
        description: `Merge Request #${mrId}`
      };
    }

    // GitHub Pull Requests
    if (hostname.includes('github.com') && pathname.includes('/pull/')) {
      const prId = pathname.match(/\/pull\/(\d+)/)?.[1];
      return {
        type: 'pull-request',
        platform: 'GitHub',
        identifier: prId,
        color: '#24292F',
        icon: 'git-branch',
        description: `Pull Request #${prId}`
      };
    }

    // GitHub Issues
    if (hostname.includes('github.com') && pathname.includes('/issues/')) {
      const issueId = pathname.match(/\/issues\/(\d+)/)?.[1];
      return {
        type: 'github-issue',
        platform: 'GitHub',
        identifier: issueId,
        color: '#24292F',
        icon: 'alert-circle',
        description: `Issue #${issueId}`
      };
    }

    // GitHub Commits
    if (hostname.includes('github.com') && pathname.includes('/commit/')) {
      const commitHash = pathname.match(/\/commit\/([a-f0-9]{7,40})/)?.[1];
      return {
        type: 'github-issue', // Reuse type for commits
        platform: 'GitHub',
        identifier: commitHash?.substring(0, 8),
        color: '#24292F',
        icon: 'git-branch',
        description: `Commit ${commitHash?.substring(0, 8)}`
      };
    }

    // GitHub Branches
    if (hostname.includes('github.com') && pathname.includes('/tree/')) {
      const branchName = pathname.match(/\/tree\/([^\/]+)/)?.[1];
      return {
        type: 'github-issue', // Reuse type for branches
        platform: 'GitHub',
        identifier: branchName,
        color: '#24292F',
        icon: 'git-branch',
        description: `Branch ${branchName}`
      };
    }

    // GitHub Tags
    if (hostname.includes('github.com') && pathname.includes('/releases/tag/')) {
      const tagName = pathname.match(/\/tag\/([^\/]+)/)?.[1];
      return {
        type: 'github-issue', // Reuse type for tags
        platform: 'GitHub',
        identifier: tagName,
        color: '#24292F',
        icon: 'git-branch',
        description: `Tag ${tagName}`
      };
    }

    // GitLab Issues
    if (hostname.includes('gitlab.com') && pathname.includes('/-/issues/')) {
      const issueId = pathname.match(/\/issues\/(\d+)/)?.[1];
      return {
        type: 'gitlab-issue',
        platform: 'GitLab',
        identifier: issueId,
        color: '#FC6D26',
        icon: 'alert-circle',
        description: `Issue #${issueId}`
      };
    }

    // GitLab Commits
    if (hostname.includes('gitlab.com') && pathname.includes('/-/commit/')) {
      const commitHash = pathname.match(/\/commit\/([a-f0-9]{7,40})/)?.[1];
      return {
        type: 'github-issue', // Reuse type for commits
        platform: 'GitLab',
        identifier: commitHash?.substring(0, 8),
        color: '#FC6D26',
        icon: 'git-branch',
        description: `Commit ${commitHash?.substring(0, 8)}`
      };
    }

    // GitLab Branches
    if (hostname.includes('gitlab.com') && pathname.includes('/-/tree/')) {
      const branchName = pathname.match(/\/tree\/([^\/]+)/)?.[1];
      return {
        type: 'github-issue', // Reuse type for branches
        platform: 'GitLab',
        identifier: branchName,
        color: '#FC6D26',
        icon: 'git-branch',
        description: `Branch ${branchName}`
      };
    }

    // GitLab Tags
    if (hostname.includes('gitlab.com') && pathname.includes('/-/tags/')) {
      const tagName = pathname.match(/\/tags\/([^\/]+)/)?.[1];
      return {
        type: 'github-issue', // Reuse type for tags
        platform: 'GitLab',
        identifier: tagName,
        color: '#FC6D26',
        icon: 'git-branch',
        description: `Tag ${tagName}`
      };
    }

    // Jira - Comprehensive detection
    if (hostname.includes('atlassian.net') || hostname.includes('jira.com')) {
      // Jira Tickets (specific ticket pages)
      const ticketMatch = pathname.match(/\/([A-Z]+-\d+)/);
      if (ticketMatch) {
        return {
          type: 'jira-ticket',
          platform: 'Jira',
          identifier: ticketMatch[1],
          color: '#0052CC',
          icon: 'ticket',
          description: `Ticket ${ticketMatch[1]}`
        };
      }

      // Jira Boards
      if (pathname.includes('/boards/')) {
        const boardMatch = pathname.match(/\/boards\/(\d+)/);
        const projectMatch = pathname.match(/\/projects\/([A-Z]+)/);
        const project = projectMatch?.[1];
        const boardId = boardMatch?.[1];
        
        return {
          type: 'jira-ticket',
          platform: 'Jira',
          identifier: boardId ? `Board ${boardId}` : 'Board',
          color: '#0052CC',
          icon: 'ticket',
          description: project ? `${project} Board` : 'Jira Board'
        };
      }

      // Jira Projects
      if (pathname.includes('/projects/')) {
        const projectMatch = pathname.match(/\/projects\/([A-Z]+)/);
        const project = projectMatch?.[1];
        
        return {
          type: 'jira-ticket',
          platform: 'Jira',
          identifier: project,
          color: '#0052CC',
          icon: 'ticket',
          description: project ? `${project} Project` : 'Jira Project'
        };
      }

      // Jira Issues (search/filter pages)
      if (pathname.includes('/issues/') || pathname.includes('/browse/')) {
        return {
          type: 'jira-ticket',
          platform: 'Jira',
          color: '#0052CC',
          icon: 'ticket',
          description: 'Jira Issues'
        };
      }

      // Jira Dashboards
      if (pathname.includes('/dashboard/')) {
        return {
          type: 'jira-ticket',
          platform: 'Jira',
          color: '#0052CC',
          icon: 'ticket',
          description: 'Jira Dashboard'
        };
      }

      // Jira Reports
      if (pathname.includes('/reports/')) {
        return {
          type: 'jira-ticket',
          platform: 'Jira',
          color: '#0052CC',
          icon: 'ticket',
          description: 'Jira Reports'
        };
      }

      // Any other Jira page
      return {
        type: 'jira-ticket',
        platform: 'Jira',
        color: '#0052CC',
        icon: 'ticket',
        description: 'Jira Page'
      };
    }

    // Confluence Pages
    if (hostname.includes('atlassian.net') && pathname.includes('/wiki/')) {
      return {
        type: 'confluence-page',
        platform: 'Confluence',
        color: '#172B4D',
        icon: 'document',
        description: 'Documentation Page'
      };
    }

    // Linear Tickets
    if (hostname.includes('linear.app')) {
      const ticketMatch = pathname.match(/\/([A-Z]+-\d+)/);
      if (ticketMatch) {
        return {
          type: 'linear-ticket',
          platform: 'Linear',
          identifier: ticketMatch[1],
          color: '#5E6AD2',
          icon: 'ticket',
          description: `Ticket ${ticketMatch[1]}`
        };
      }
    }

    // Asana Tasks
    if (hostname.includes('app.asana.com')) {
      return {
        type: 'asana-task',
        platform: 'Asana',
        color: '#F06A6A',
        icon: 'check-square',
        description: 'Task'
      };
    }

    // Trello Cards
    if (hostname.includes('trello.com')) {
      return {
        type: 'trello-card',
        platform: 'Trello',
        color: '#0079BF',
        icon: 'credit-card',
        description: 'Card'
      };
    }

    // Notion Pages
    if (hostname.includes('notion.so')) {
      return {
        type: 'notion-page',
        platform: 'Notion',
        color: '#000000',
        icon: 'file-text',
        description: 'Notion Page'
      };
    }

    // Figma Designs
    if (hostname.includes('figma.com')) {
      return {
        type: 'figma-design',
        platform: 'Figma',
        color: '#F24E1E',
        icon: 'image',
        description: 'Design File'
      };
    }

    // Slack Channels
    if (hostname.includes('slack.com')) {
      return {
        type: 'slack-channel',
        platform: 'Slack',
        color: '#4A154B',
        icon: 'message-circle',
        description: 'Slack Channel'
      };
    }

    // Discord Channels
    if (hostname.includes('discord.com')) {
      return {
        type: 'discord-channel',
        platform: 'Discord',
        color: '#5865F2',
        icon: 'message-circle',
        description: 'Discord Channel'
      };
    }

    // YouTube Videos
    if (hostname.includes('youtube.com') || hostname.includes('youtu.be')) {
      return {
        type: 'youtube-video',
        platform: 'YouTube',
        color: '#FF0000',
        icon: 'video',
        description: 'Video'
      };
    }

    // Stack Overflow
    if (hostname.includes('stackoverflow.com')) {
      return {
        type: 'stackoverflow',
        platform: 'Stack Overflow',
        color: '#F48024',
        icon: 'help-circle',
        description: 'Q&A Post'
      };
    }

    // Medium Articles
    if (hostname.includes('medium.com')) {
      return {
        type: 'medium-article',
        platform: 'Medium',
        color: '#00AB6C',
        icon: 'book-open',
        description: 'Article'
      };
    }

    // Dev.to Posts
    if (hostname.includes('dev.to')) {
      return {
        type: 'dev-post',
        platform: 'Dev.to',
        color: '#0A0A0A',
        icon: 'book-open',
        description: 'Blog Post'
      };
    }

    // Hacker News
    if (hostname.includes('news.ycombinator.com')) {
      return {
        type: 'hackernews',
        platform: 'Hacker News',
        color: '#FF6600',
        icon: 'trending-up',
        description: 'News Post'
      };
    }

    // Reddit Posts
    if (hostname.includes('reddit.com')) {
      return {
        type: 'reddit-post',
        platform: 'Reddit',
        color: '#FF4500',
        icon: 'message-square',
        description: 'Reddit Post'
      };
    }

    // Twitter/X Posts
    if (hostname.includes('twitter.com') || hostname.includes('x.com')) {
      return {
        type: 'twitter-post',
        platform: 'Twitter/X',
        color: '#1DA1F2',
        icon: 'twitter',
        description: 'Tweet'
      };
    }

    // LinkedIn Posts
    if (hostname.includes('linkedin.com')) {
      return {
        type: 'linkedin-post',
        platform: 'LinkedIn',
        color: '#0077B5',
        icon: 'linkedin',
        description: 'LinkedIn Post'
      };
    }

    // NPM Packages
    if (hostname.includes('npmjs.com')) {
      return {
        type: 'npm-package',
        platform: 'NPM',
        color: '#CB3837',
        icon: 'package',
        description: 'NPM Package'
      };
    }

    // Docker Hub
    if (hostname.includes('hub.docker.com')) {
      return {
        type: 'docker-hub',
        platform: 'Docker Hub',
        color: '#2496ED',
        icon: 'box',
        description: 'Docker Image'
      };
    }

    // Kubernetes Documentation
    if (hostname.includes('kubernetes.io')) {
      return {
        type: 'kubernetes-docs',
        platform: 'Kubernetes',
        color: '#326CE5',
        icon: 'book',
        description: 'K8s Documentation'
      };
    }

    // AWS Documentation
    if (hostname.includes('docs.aws.amazon.com')) {
      return {
        type: 'aws-docs',
        platform: 'AWS',
        color: '#FF9900',
        icon: 'cloud',
        description: 'AWS Documentation'
      };
    }

    // Google Cloud Documentation
    if (hostname.includes('cloud.google.com')) {
      return {
        type: 'google-cloud',
        platform: 'Google Cloud',
        color: '#4285F4',
        icon: 'cloud',
        description: 'GCP Documentation'
      };
    }

    // Azure Documentation
    if (hostname.includes('docs.microsoft.com') && pathname.includes('/azure/')) {
      return {
        type: 'azure-docs',
        platform: 'Azure',
        color: '#0078D4',
        icon: 'cloud',
        description: 'Azure Documentation'
      };
    }

    // Bitbucket (GitLab alternative)
    if (hostname.includes('bitbucket.org')) {
      if (pathname.includes('/pull-requests/')) {
        const prId = pathname.match(/\/pull-requests\/(\d+)/)?.[1];
        return {
          type: 'pull-request',
          platform: 'Bitbucket',
          identifier: prId,
          color: '#0052CC',
          icon: 'git-branch',
          description: `Pull Request #${prId}`
        };
      } else if (pathname.includes('/issues/')) {
        const issueId = pathname.match(/\/issues\/(\d+)/)?.[1];
        return {
          type: 'github-issue',
          platform: 'Bitbucket',
          identifier: issueId,
          color: '#0052CC',
          icon: 'alert-circle',
          description: `Issue #${issueId}`
        };
      }
    }

    // Azure DevOps
    if (hostname.includes('dev.azure.com') || hostname.includes('visualstudio.com')) {
      if (pathname.includes('/pullrequest/')) {
        const prId = pathname.match(/\/pullrequest\/(\d+)/)?.[1];
        return {
          type: 'pull-request',
          platform: 'Azure DevOps',
          identifier: prId,
          color: '#0078D4',
          icon: 'git-branch',
          description: `Pull Request #${prId}`
        };
      } else if (pathname.includes('/workitems/')) {
        const workItemId = pathname.match(/\/workitems\/(\d+)/)?.[1];
        return {
          type: 'jira-ticket',
          platform: 'Azure DevOps',
          identifier: workItemId,
          color: '#0078D4',
          icon: 'ticket',
          description: `Work Item #${workItemId}`
        };
      }
    }

    // ClickUp
    if (hostname.includes('clickup.com')) {
      return {
        type: 'asana-task',
        platform: 'ClickUp',
        color: '#7B68EE',
        icon: 'check-square',
        description: 'ClickUp Task'
      };
    }

    // Monday.com
    if (hostname.includes('monday.com')) {
      return {
        type: 'asana-task',
        platform: 'Monday.com',
        color: '#00C875',
        icon: 'check-square',
        description: 'Monday.com Item'
      };
    }

    // Airtable
    if (hostname.includes('airtable.com')) {
      return {
        type: 'asana-task',
        platform: 'Airtable',
        color: '#18BFFF',
        icon: 'check-square',
        description: 'Airtable Record'
      };
    }

    // Miro
    if (hostname.includes('miro.com')) {
      return {
        type: 'figma-design',
        platform: 'Miro',
        color: '#050038',
        icon: 'image',
        description: 'Miro Board'
      };
    }

    // Canva
    if (hostname.includes('canva.com')) {
      return {
        type: 'figma-design',
        platform: 'Canva',
        color: '#00C4CC',
        icon: 'image',
        description: 'Canva Design'
      };
    }

    // Google Meet
    if (hostname.includes('meet.google.com')) {
      return {
        type: 'slack-channel',
        platform: 'Google Meet',
        color: '#00897B',
        icon: 'video',
        description: 'Google Meet'
      };
    }

    // Zoom
    if (hostname.includes('zoom.us')) {
      return {
        type: 'slack-channel',
        platform: 'Zoom',
        color: '#2D8CFF',
        icon: 'video',
        description: 'Zoom Meeting'
      };
    }

    // Teams
    if (hostname.includes('teams.microsoft.com')) {
      return {
        type: 'slack-channel',
        platform: 'Microsoft Teams',
        color: '#6264A7',
        icon: 'message-circle',
        description: 'Teams Chat'
      };
    }

    // Databricks
    if (hostname.includes('databricks.com')) {
      return {
        type: 'databricks',
        platform: 'Databricks',
        color: '#FF3621',
        icon: 'database',
        description: 'Databricks Workspace'
      };
    }

    // Snowflake
    if (hostname.includes('snowflake.com')) {
      return {
        type: 'snowflake',
        platform: 'Snowflake',
        color: '#29B5E8',
        icon: 'database',
        description: 'Snowflake Console'
      };
    }

    // Tableau
    if (hostname.includes('tableau.com')) {
      return {
        type: 'tableau',
        platform: 'Tableau',
        color: '#E97627',
        icon: 'bar-chart-3',
        description: 'Tableau Dashboard'
      };
    }

    // Power BI
    if (hostname.includes('app.powerbi.com')) {
      return {
        type: 'powerbi',
        platform: 'Power BI',
        color: '#F2C811',
        icon: 'bar-chart-3',
        description: 'Power BI Report'
      };
    }

    // Jupyter Notebooks
    if (hostname.includes('jupyter.org') || pathname.includes('.ipynb')) {
      return {
        type: 'jupyter-notebook',
        platform: 'Jupyter',
        color: '#F37626',
        icon: 'code',
        description: 'Jupyter Notebook'
      };
    }

    // Kaggle
    if (hostname.includes('kaggle.com')) {
      return {
        type: 'kaggle',
        platform: 'Kaggle',
        color: '#20BEFF',
        icon: 'database',
        description: 'Kaggle Dataset/Notebook'
      };
    }

    // LeetCode
    if (hostname.includes('leetcode.com')) {
      return {
        type: 'leetcode',
        platform: 'LeetCode',
        color: '#FFA116',
        icon: 'code',
        description: 'Coding Problem'
      };
    }

    // HackerRank
    if (hostname.includes('hackerrank.com')) {
      return {
        type: 'hackerrank',
        platform: 'HackerRank',
        color: '#00EA64',
        icon: 'code',
        description: 'Coding Challenge'
      };
    }

    // CodeWars
    if (hostname.includes('codewars.com')) {
      return {
        type: 'codewars',
        platform: 'CodeWars',
        color: '#B1361E',
        icon: 'code',
        description: 'Coding Kata'
      };
    }

    // Udemy
    if (hostname.includes('udemy.com')) {
      return {
        type: 'udemy',
        platform: 'Udemy',
        color: '#A435F0',
        icon: 'book-open',
        description: 'Course'
      };
    }

    // Coursera
    if (hostname.includes('coursera.org')) {
      return {
        type: 'coursera',
        platform: 'Coursera',
        color: '#0056D2',
        icon: 'book-open',
        description: 'Course'
      };
    }

    // edX
    if (hostname.includes('edx.org')) {
      return {
        type: 'edx',
        platform: 'edX',
        color: '#022B3A',
        icon: 'book-open',
        description: 'Course'
      };
    }

    // Generic documentation sites
    if (pathname.includes('/docs/') || pathname.includes('/documentation/')) {
      return {
        type: 'documentation',
        platform: 'Documentation',
        color: '#6B7280',
        icon: 'book',
        description: 'Documentation'
      };
    }

    // API documentation
    if (pathname.includes('/api/') || pathname.includes('/swagger/') || pathname.includes('/openapi/')) {
      return {
        type: 'api-docs',
        platform: 'API Docs',
        color: '#059669',
        icon: 'code',
        description: 'API Documentation'
      };
    }

    // Default case
    return {
      type: 'other',
      platform: 'Website',
      color: '#6B7280',
      icon: 'globe',
      description: 'Web Page'
    };

  } catch {
    return {
      type: 'other',
      platform: 'Website',
      color: '#6B7280',
      icon: 'globe',
      description: 'Web Page'
    };
  }
} 