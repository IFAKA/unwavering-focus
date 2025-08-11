/**
 * Detects AI Chatbot URLs
 */
export function isAiChatbotUrl(url: string): boolean {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();
    const pathname = urlObj.pathname;
    
    // AI Chatbot patterns
    const aiChatbotPatterns = [
      // Gemini
      /^gemini\.google\.com$/,
      // Copilot
      /^copilot\.microsoft\.com$/,
      // Perplexity
      /^www\.perplexity\.ai$/,
      // Grok
      /^grok\.com$/,
      // ChatGPT
      /^chatgpt\.com$/
    ];
    
    // Check if hostname matches any AI chatbot pattern
    const isAiChatbot = aiChatbotPatterns.some(pattern => pattern.test(hostname));
    
    // Additional path checks for specific patterns
    if (isAiChatbot) {
      // Check for chat-specific paths
      const chatPaths = [
        /^\/app\//, // Gemini app
        /^\/chats\//, // Copilot chats
        /^\/search\//, // Perplexity search
        /^\/chat\//, // Grok chat
        /^\/c\// // ChatGPT conversation
      ];
      
      return chatPaths.some(pattern => pattern.test(pathname));
    }
    
    return false;
  } catch {
    return false;
  }
}

/**
 * Detects AI Chatbot URLs with "Copy link to Highlight"
 */
export function isAiChatbotCopyLinkToHighlight(url: string): boolean {
  return isAiChatbotUrl(url) && isCopyLinkToHighlight(url);
}

/**
 * Helper function to get AI chatbot platform name
 */
export function getAiChatbotPlatform(hostname: string): string {
  if (hostname.includes('gemini.google.com')) return 'Gemini';
  if (hostname.includes('copilot.microsoft.com')) return 'Copilot';
  if (hostname.includes('perplexity.ai')) return 'Perplexity';
  if (hostname.includes('grok.com')) return 'Grok';
  if (hostname.includes('chatgpt.com')) return 'ChatGPT';
  return 'AI Chatbot';
}

// Import the highlight detector function
import { isCopyLinkToHighlight } from './highlight-detector';
