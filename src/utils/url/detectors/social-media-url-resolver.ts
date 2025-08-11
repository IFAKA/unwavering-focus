import { UrlTypeInfo } from '../url-types';
import { 
  isYouTubeUrl, 
  isRedditUrl, 
  isTwitterUrl, 
  isLinkedInUrl, 
  isSlackUrl, 
  isDiscordUrl 
} from './social-media-detector';

/**
 * Resolves social media platform URL types
 */
export function resolveSocialMediaUrl(url: string): UrlTypeInfo | null {
  // YouTube
  if (isYouTubeUrl(url)) {
    return {
      type: 'youtube-video',
      platform: 'YouTube',
      color: '#FF0000',
      icon: 'video',
      description: 'Video'
    };
  }

  // Reddit
  if (isRedditUrl(url)) {
    return {
      type: 'reddit-post',
      platform: 'Reddit',
      color: '#FF4500',
      icon: 'message-square',
      description: 'Reddit Post'
    };
  }

  // Twitter/X
  if (isTwitterUrl(url)) {
    return {
      type: 'twitter-post',
      platform: 'Twitter/X',
      color: '#1DA1F2',
      icon: 'twitter',
      description: 'Tweet'
    };
  }

  // LinkedIn
  if (isLinkedInUrl(url)) {
    return {
      type: 'linkedin-post',
      platform: 'LinkedIn',
      color: '#0077B5',
      icon: 'linkedin',
      description: 'LinkedIn Post'
    };
  }

  // Slack
  if (isSlackUrl(url)) {
    return {
      type: 'slack-channel',
      platform: 'Slack',
      color: '#4A154B',
      icon: 'message-circle',
      description: 'Slack Channel'
    };
  }

  // Discord
  if (isDiscordUrl(url)) {
    return {
      type: 'discord-channel',
      platform: 'Discord',
      color: '#5865F2',
      icon: 'message-circle',
      description: 'Discord Channel'
    };
  }

  return null;
}
