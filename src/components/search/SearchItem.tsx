import React from 'react';
import { SearchQuery } from '../../types';
import { isUrl, formatUrlForDisplay } from '../../utils/urlUtils';
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
  const displayText = isUrl(query.query) 
    ? formatUrlForDisplay(query.query)
    : query.query;

  return (
    <AppleWatchCard
      variant="interactive"
      padding="medium"
      className="group relative overflow-hidden not-first:mt-sm"
    >
      <div className="text-sm ds-text-primary overflow-hidden text-ellipsis whitespace-nowrap" title={query.query}>
        {displayText}
      </div>
      
      <div className="absolute top-1/2 right-sm -translate-y-1/2 flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity duration-normal bg-bg-secondary p-xs rounded shadow-sm">
        <button 
          className="ds-button ds-button-small"
          onClick={() => onSearch(query)}
          title={isUrl(query.query) ? "Go to this URL" : "Search on Google Scholar"}
        >
          <AppleWatchIcon name="search" size="sm" />
        </button>
        
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