// Re-export all URL detection functions from the new modular structure
export { detectUrlType } from './url-detection-main';
export { 
  isCopyLinkToHighlight, 
  extractHighlightedText 
} from './detectors/highlight-detector';
export { 
  isAiChatbotUrl, 
  isAiChatbotCopyLinkToHighlight, 
  getAiChatbotPlatform 
} from './detectors/ai-chatbot-detector';
