import React, { useState, useMemo } from 'react';
import { SearchQuery } from '../../types';
import { isUrl, detectUrlType } from '../../utils/urlUtils';
import SearchItem from './SearchItem';
import AppleWatchIcon from '../ui/AppleWatchIcon';

interface SearchListProps {
  searches: SearchQuery[];
  onSearch: (query: SearchQuery) => void;
  onCopy: (text: string) => void;
  onDelete: (id: string) => void;
  copyStatus: 'idle' | 'copied';
}

type FilterType = 'all' | 'urls' | 'text' | 'work' | 'learning' | 'social';

const SearchList: React.FC<SearchListProps> = ({
  searches,
  onSearch,
  onCopy,
  onDelete,
  copyStatus
}) => {
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  // Group searches by type for better organization
  const groupedSearches = useMemo(() => {
    const groups = {
      work: [] as SearchQuery[],
      learning: [] as SearchQuery[],
      social: [] as SearchQuery[],
      other: [] as SearchQuery[]
    };

    searches.forEach(search => {
      if (isUrl(search.query)) {
        const urlType = detectUrlType(search.query);
        
        // Categorize based on URL type
        if (['merge-request', 'pull-request', 'jira-ticket', 'linear-ticket', 'asana-task', 'trello-card', 'confluence-page', 'notion-page', 'figma-design', 'slack-channel', 'discord-channel', 'github-issue', 'gitlab-issue'].includes(urlType.type)) {
          groups.work.push(search);
        } else if (['youtube-video', 'medium-article', 'dev-post', 'stackoverflow', 'documentation', 'api-docs', 'npm-package', 'docker-hub', 'kubernetes-docs', 'aws-docs', 'google-cloud', 'azure-docs', 'jupyter-notebook', 'kaggle', 'leetcode', 'hackerrank', 'codewars', 'udemy', 'coursera', 'edx'].includes(urlType.type)) {
          groups.learning.push(search);
        } else if (['twitter-post', 'linkedin-post', 'reddit-post', 'hackernews'].includes(urlType.type)) {
          groups.social.push(search);
        } else {
          groups.other.push(search);
        }
      } else {
        groups.other.push(search);
      }
    });

    return groups;
  }, [searches]);

  // Filter searches based on active filter
  const filteredSearches = useMemo(() => {
    switch (activeFilter) {
      case 'urls':
        return searches.filter(search => isUrl(search.query));
      case 'text':
        return searches.filter(search => !isUrl(search.query));
      case 'work':
        return groupedSearches.work;
      case 'learning':
        return groupedSearches.learning;
      case 'social':
        return groupedSearches.social;
      default:
        return searches;
    }
  }, [searches, activeFilter, groupedSearches]);

  const getFilterStats = () => {
    const total = searches.length;
    const urls = searches.filter(s => isUrl(s.query)).length;
    const text = total - urls;
    const work = groupedSearches.work.length;
    const learning = groupedSearches.learning.length;
    const social = groupedSearches.social.length;

    return { total, urls, text, work, learning, social };
  };

  const stats = getFilterStats();

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
      {/* Header with stats and filters */}
      <div className="py-md border-b border-bg-tertiary mb-md">
        <div className="flex justify-between items-center mb-sm">
          <span className="text-xs font-semibold text-text-secondary uppercase tracking-[0.5px]">
            Saved Items
          </span>
          <span className="text-sm text-accent-primary font-semibold">
            {stats.total}
          </span>
        </div>
        
        {/* Filter tabs */}
        <div className="overflow-x-auto scrollbar-hide">
          <div className="flex gap-xs min-w-max">
            {[
              { key: 'all', label: 'All', icon: 'saved', count: stats.total },
              { key: 'work', label: 'Work', icon: 'building', count: stats.work },
              { key: 'learning', label: 'Learning', icon: 'book-open', count: stats.learning },
              { key: 'social', label: 'Social', icon: 'message-circle', count: stats.social },
              { key: 'urls', label: 'URLs', icon: 'globe', count: stats.urls },
              { key: 'text', label: 'Text', icon: 'file-text', count: stats.text }
            ].map(filter => (
              <button
                key={filter.key}
                onClick={() => setActiveFilter(filter.key as FilterType)}
                className={`flex items-center gap-xs px-sm py-xs rounded-full transition-all duration-normal whitespace-nowrap ${
                  activeFilter === filter.key
                    ? 'bg-accent-primary text-white shadow-sm'
                    : 'text-text-secondary hover:text-text-primary hover:bg-bg-tertiary'
                }`}
                title={`${filter.label}: ${filter.count}`}
              >
                <AppleWatchIcon 
                  name={filter.icon as any} 
                  size="xs" 
                  className={activeFilter === filter.key ? 'text-white' : 'text-text-secondary'}
                />
                <span className="text-xs font-medium">{filter.label}</span>
                {filter.count > 0 && (
                  <span className={`text-xs px-xs py-0.5 rounded-full ${
                    activeFilter === filter.key 
                      ? 'bg-white bg-opacity-20 text-white' 
                      : 'bg-bg-tertiary text-text-secondary'
                  }`}>
                    {filter.count}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      <div className="overflow-y-auto flex-1">
        {filteredSearches.length === 0 ? (
          <div className="flex flex-col items-center justify-center p-lg text-center text-text-secondary">
            <AppleWatchIcon name="search" size="lg" className="opacity-50 mb-sm" />
            <div className="text-sm text-text-secondary">
              No items match the current filter.
            </div>
          </div>
        ) : (
          filteredSearches
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
            ))
        )}
      </div>
    </div>
  );
};

export default SearchList; 