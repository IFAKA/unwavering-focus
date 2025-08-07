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
      variant="default"
      padding="medium"
      interactive
      className="group relative overflow-hidden not-first:mt-sm"
    >
      <div className="text-sm text-text-primary overflow-hidden text-ellipsis whitespace-nowrap" title={query.query}>
        {displayText}
      </div>
      
      <div className="absolute top-1/2 right-sm -translate-y-1/2 flex gap-xs opacity-0 group-hover:opacity-100 transition-opacity duration-200 bg-bg-secondary p-xs rounded shadow-[0_2px_8px_rgba(0,0,0,0.3)]">
        <button 
          className="border-none bg-none text-text-secondary cursor-pointer p-xs rounded text-sm transition-all duration-200 hover:bg-accent-primary hover:text-white"
          onClick={() => onSearch(query)}
          title={isUrl(query.query) ? "Go to this URL" : "Search on Google Scholar"}
        >
          <AppleWatchIcon name="search" size="sm" />
        </button>
        
        <button 
          className={`border-none bg-none cursor-pointer p-xs rounded text-sm transition-all duration-200 ${
            copyStatus === 'copied' ? 'bg-success-color text-white' : 'text-text-secondary hover:bg-accent-secondary hover:text-white'
          }`}
          onClick={() => onCopy(query.query)}
          title="Copy to clipboard"
        >
          <AppleWatchIcon name={copyStatus === 'copied' ? 'check' : 'copy'} size="sm" />
        </button>
        
        <button 
          className="border-none bg-none text-text-secondary cursor-pointer p-xs rounded text-sm transition-all duration-200 hover:bg-danger-color hover:text-white"
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