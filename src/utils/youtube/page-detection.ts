import { YouTubePageType } from './types';

/**
 * Checks if the current page is a YouTube page
 */
export function isYouTubePage(): boolean {
  return window.location.hostname.includes('youtube.com') || 
         window.location.hostname.includes('youtu.be');
}

/**
 * Determines the type of YouTube page
 */
export function getYouTubePageType(): YouTubePageType {
  const url = window.location.href;
  
  if (url.includes('/watch')) {
    return 'video';
  } else if (url.includes('/results') || url.includes('/search')) {
    return 'search';
  } else {
    return 'other';
  }
}
