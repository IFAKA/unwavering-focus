import { UrlTypeInfo } from '../url-types';
import { 
  isNotionUrl, 
  isFigmaUrl, 
  isMediumUrl, 
  isDevToUrl, 
  isHackerNewsUrl, 
  isStackOverflowUrl 
} from './content-platform-detector';

/**
 * Resolves content platform URL types
 */
export function resolveContentPlatformUrl(url: string): UrlTypeInfo | null {
  // Notion
  if (isNotionUrl(url)) {
    return {
      type: 'notion-page',
      platform: 'Notion',
      color: '#000000',
      icon: 'file-text',
      description: 'Notion Page'
    };
  }

  // Figma
  if (isFigmaUrl(url)) {
    return {
      type: 'figma-design',
      platform: 'Figma',
      color: '#F24E1E',
      icon: 'image',
      description: 'Design File'
    };
  }

  // Medium
  if (isMediumUrl(url)) {
    return {
      type: 'medium-article',
      platform: 'Medium',
      color: '#00AB6C',
      icon: 'book-open',
      description: 'Article'
    };
  }

  // Dev.to
  if (isDevToUrl(url)) {
    return {
      type: 'dev-post',
      platform: 'Dev.to',
      color: '#0A0A0A',
      icon: 'book-open',
      description: 'Blog Post'
    };
  }

  // Hacker News
  if (isHackerNewsUrl(url)) {
    return {
      type: 'hackernews',
      platform: 'Hacker News',
      color: '#FF6600',
      icon: 'trending-up',
      description: 'News Post'
    };
  }

  // Stack Overflow
  if (isStackOverflowUrl(url)) {
    return {
      type: 'stackoverflow',
      platform: 'Stack Overflow',
      color: '#F48024',
      icon: 'help-circle',
      description: 'Q&A Post'
    };
  }

  return null;
}
