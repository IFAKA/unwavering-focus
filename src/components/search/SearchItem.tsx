import React from 'react';
import { SearchQuery } from '../../types';
import { isUrl, formatUrlForDisplay, detectUrlType } from '../../utils/urlUtils';
import AppleWatchCard from '../ui/AppleWatchCard';
import AppleWatchIcon from '../ui/AppleWatchIcon';
import { getUrlTypeActionButton } from './url-type-actions';

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
        {getUrlTypeActionButton(urlTypeInfo, isUrlItem, query, onSearch)}
        
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