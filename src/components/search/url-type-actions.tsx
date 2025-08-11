import React from 'react';
import { SearchQuery } from '../../types';
import AppleWatchIcon from '../ui/AppleWatchIcon';

interface UrlTypeInfo {
  type: string;
  platform: string;
  description: string;
  color: string;
  icon: string;
  identifier?: string;
}



export function getUrlTypeActionButton(
  urlTypeInfo: UrlTypeInfo | null,
  isUrlItem: boolean,
  query: SearchQuery,
  onSearch: (query: SearchQuery) => void
): React.ReactElement {
  if (!isUrlItem) {
    return (
      <button 
        className="ds-button ds-button-small"
        onClick={() => onSearch(query)}
        title="Search on Google Scholar"
      >
        <AppleWatchIcon name="search" size="sm" />
      </button>
    );
  }

  // Specialized actions for different URL types
  switch (urlTypeInfo?.type) {
    case 'ai-chatbot-highlight':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title={`Open ${urlTypeInfo.platform} Chat Highlight`}
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="message-square" size="sm" />
        </button>
      );
    
    case 'ai-chatbot':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title={`Open ${urlTypeInfo.platform} Chat`}
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="message-square" size="sm" />
        </button>
      );
    
    case 'copy-link-highlight':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title="Open Text Highlight"
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="highlighter" size="sm" />
        </button>
      );
    
    case 'merge-request':
    case 'pull-request':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title={`Open ${urlTypeInfo.platform} ${urlTypeInfo.description}`}
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="git-branch" size="sm" />
        </button>
      );
    
    case 'jira-ticket':
    case 'linear-ticket':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title={`Open ${urlTypeInfo.platform} ${urlTypeInfo.description}`}
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="ticket" size="sm" />
        </button>
      );
    
    case 'github-issue':
    case 'gitlab-issue':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title={`Open ${urlTypeInfo.platform} ${urlTypeInfo.description}`}
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="alert-circle" size="sm" />
        </button>
      );
    
    case 'youtube-video':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title="Watch Video"
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="video" size="sm" />
        </button>
      );
    
    case 'stackoverflow':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title="View Q&A Post"
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="help-circle" size="sm" />
        </button>
      );
    
    case 'medium-article':
    case 'dev-post':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title="Read Article"
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="book-open" size="sm" />
        </button>
      );
    
    case 'npm-package':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title="View NPM Package"
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="package" size="sm" />
        </button>
      );
    
    case 'docker-hub':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title="View Docker Image"
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="box" size="sm" />
        </button>
      );
    
    case 'documentation':
    case 'api-docs':
    case 'kubernetes-docs':
    case 'aws-docs':
    case 'google-cloud':
    case 'azure-docs':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title={`View ${urlTypeInfo.description}`}
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="book" size="sm" />
        </button>
      );
    
    case 'jupyter-notebook':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title="Open Jupyter Notebook"
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="code" size="sm" />
        </button>
      );
    
    case 'leetcode':
    case 'hackerrank':
    case 'codewars':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title={`Open ${urlTypeInfo.description}`}
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="code" size="sm" />
        </button>
      );
    
    case 'udemy':
    case 'coursera':
    case 'edx':
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title={`Open ${urlTypeInfo.description}`}
          style={{ backgroundColor: urlTypeInfo.color, borderColor: urlTypeInfo.color }}
        >
          <AppleWatchIcon name="book-open" size="sm" />
        </button>
      );
    
    default:
      return (
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title={isUrlItem ? "Go to this URL" : "Search on Google Scholar"}
        >
          <AppleWatchIcon name="search" size="sm" />
        </button>
      );
  }
}
