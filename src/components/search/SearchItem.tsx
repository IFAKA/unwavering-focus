import React from 'react';
import { SearchQuery } from '../../types';
import { isUrl, formatUrlForDisplay, detectUrlType } from '../../utils/urlUtils';
import AppleWatchCard from '../ui/AppleWatchCard';
import AppleWatchIcon from '../ui/AppleWatchIcon';

interface SearchItemProps {
  query: SearchQuery;
  onSearch: (query: SearchQuery) => void;
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
  copyStatus: 'idle' | 'copied';
}

const SearchItem: React.FC<SearchItemProps> = ({
  query,
  onSearch,
  onCopy,
  onDelete,
  copyStatus
}) => {
  const isUrlItem = isUrl(query.query);
  const urlTypeInfo = isUrlItem ? detectUrlType(query.query) : null;
  const displayText = isUrlItem 
    ? formatUrlForDisplay(query.query)
    : query.query;

  // Get specialized styling based on URL type
  const getUrlTypeStyling = () => {
    if (!urlTypeInfo) return {};
    
    return {
      borderLeft: `3px solid ${urlTypeInfo.color}`,
      backgroundColor: `${urlTypeInfo.color}10`,
    };
  };

  // Get specialized action button based on URL type
  const getActionButton = () => {
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
  };

  return (
    <AppleWatchCard
      variant="interactive"
      padding="medium"
      className="group relative overflow-hidden not-first:mt-sm"
      style={getUrlTypeStyling()}
    >
      <div className="flex items-center gap-sm">
        {/* URL Type Icon */}
        {urlTypeInfo && (
          <div 
            className="flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center"
            style={{ backgroundColor: `${urlTypeInfo.color}20` }}
          >
            <AppleWatchIcon 
              name={urlTypeInfo.icon as any} 
              size="xs" 
              color={urlTypeInfo.color}
            />
          </div>
        )}
        
        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="text-sm ds-text-primary overflow-hidden text-ellipsis whitespace-nowrap" title={query.query}>
            {displayText}
          </div>
          
          {/* URL Type Description */}
          {urlTypeInfo && (
            <div className="text-xs text-text-secondary mt-xs">
              {urlTypeInfo.description}
              {urlTypeInfo.identifier && (
                <span className="ml-xs px-xs py-0.5 rounded text-xs font-medium" 
                      style={{ backgroundColor: `${urlTypeInfo.color}20`, color: urlTypeInfo.color }}>
                  {urlTypeInfo.identifier}
                </span>
              )}
            </div>
          )}
        </div>
      </div>
      
      <div className="absolute top-1/2 right-sm -translate-y-1/2 flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity duration-normal bg-bg-secondary p-xs rounded shadow-sm">
        {getActionButton()}
        
        <button 
          className={`ds-button ds-button-small ${
            copyStatus === 'copied' ? 'ds-button-success' : 'ds-button-secondary'
          }`}
          onClick={() => onCopy(query.query)}
          title="Copy to clipboard"
        >
          <AppleWatchIcon name={copyStatus === 'copied' ? 'check' : 'copy'} size="sm" />
        </button>
        
        <button 
          className="ds-button ds-button-small ds-button-danger"
          onClick={() => onDelete(query.id)}
          title="Delete"
        >
          <AppleWatchIcon name="delete" size="sm" />
        </button>
      </div>
    </AppleWatchCard>
  );
};

export default SearchItem; 