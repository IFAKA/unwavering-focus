import { UrlTypeInfo } from '../url-types';
import { extractHighlightedText } from './highlight-detector';
import { isAiChatbotUrl, getAiChatbotPlatform } from './ai-chatbot-detector';

/**
 * Resolves highlighted URL types
 */
export function resolveHighlightedUrl(url: string, hostname: string): UrlTypeInfo | null {
  const highlightedText = extractHighlightedText(url);
  if (highlightedText) {
    // For any highlighted URL, prioritize the highlighted content
    const platform = isAiChatbotUrl(url) ? getAiChatbotPlatform(hostname) : 'Web';
    const type = isAiChatbotUrl(url) ? 'ai-chatbot-highlight' : 'copy-link-highlight';
    const color = isAiChatbotUrl(url) ? '#FF6B6B' : '#FFD93D';
    const icon = isAiChatbotUrl(url) ? 'message-square' : 'highlighter';
    
    // Show the source/platform in description instead of redundant text
    const description = isAiChatbotUrl(url) 
      ? `${platform} Chat Highlight` 
      : `Text Highlight from ${hostname.replace(/^www\./, '')}`;
    
    return {
      type: type,
      platform: platform,
      color: color,
      icon: icon,
      description: description
    };
  }
  
  return null;
}

/**
 * Resolves AI chatbot URL types
 */
export function resolveAiChatbotUrl(hostname: string): UrlTypeInfo | null {
  if (isAiChatbotUrl(hostname)) {
    const platform = getAiChatbotPlatform(hostname);
    return {
      type: 'ai-chatbot',
      platform: platform,
      color: '#4ECDC4',
      icon: 'message-square',
      description: `${platform} Chat`
    };
  }
  
  return null;
}

/**
 * Returns default URL type info
 */
export function getDefaultUrlType(): UrlTypeInfo {
  return {
    type: 'other',
    platform: 'Website',
    color: '#6B7280',
    icon: 'globe',
    description: 'Web Page'
  };
}
