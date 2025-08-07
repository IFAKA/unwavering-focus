import React from 'react';
import { SearchQuery } from '../../types';
import SearchItem from './SearchItem';
import AppleWatchIcon from '../ui/AppleWatchIcon';

interface SearchListProps {
  searches: SearchQuery[];
  onSearch: (query: SearchQuery) => void;
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
  copyStatus: 'idle' | 'copied';
}

const SearchList: React.FC<SearchListProps> = ({
  searches,
  onSearch,
  onCopy,
  onDelete,
  copyStatus
}) => {
  if (searches.length === 0) {
    return (
      <div className="flex-1 flex flex-col items-center justify-center p-xl text-center text-text-secondary h-[350px] overflow-hidden">
        <div className="text-5xl mb-md opacity-60">
          <AppleWatchIcon name="saved" size="xl" />
        </div>
        <div className="text-base font-semibold text-text-primary mb-sm">No Saved Items</div>
        <div className="text-sm text-text-secondary leading-relaxed max-w-[200px]">
          Save items to search later and keep your focus intact.
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 px-lg flex flex-col h-full overflow-hidden">
      <div className="flex justify-between items-center py-md border-b border-bg-tertiary mb-md">
        <span className="text-xs font-semibold text-text-secondary uppercase tracking-[0.5px]">
          Saved Items
        </span>
        <span className="text-sm text-accent-primary font-semibold">
          {searches.length}
        </span>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {searches
          .sort((a, b) => b.timestamp - a.timestamp)
          .map((query) => (
            <SearchItem
              key={query.id}
              query={query}
              onSearch={onSearch}
              onCopy={onCopy}
              onDelete={onDelete}
              copyStatus={copyStatus}
            />
          ))}
      </div>
    </div>
  );
};

export default SearchList; 