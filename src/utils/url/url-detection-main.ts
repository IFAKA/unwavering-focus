import { UrlTypeInfo } from './url-types';
import { resolveHighlightedUrl, resolveAiChatbotUrl, getDefaultUrlType } from './detectors/url-type-resolver';
import { resolveGitUrl } from './detectors/git-url-resolver';
import { resolveProjectManagementUrl } from './detectors/project-management-url-resolver';
import { resolveContentPlatformUrl } from './detectors/content-platform-url-resolver';
import { resolveSocialMediaUrl } from './detectors/social-media-url-resolver';
import { resolveTechPlatformUrl } from './detectors/tech-platform-url-resolver';

/**
 * Detects URL type and returns type information
 */
export function detectUrlType(url: string): UrlTypeInfo {
  try {
    const urlObj = new URL(url);
    const hostname = urlObj.hostname.toLowerCase();

    // Check for highlighted text FIRST - this is what the user cares about most
    const highlightedResult = resolveHighlightedUrl(url, hostname);
    if (highlightedResult) {
      return highlightedResult;
    }

    // AI Chatbot URLs (without highlight)
    const aiChatbotResult = resolveAiChatbotUrl(hostname);
    if (aiChatbotResult) {
      return aiChatbotResult;
    }

    // Git platform URLs
    const gitResult = resolveGitUrl(url);
    if (gitResult) {
      return gitResult;
    }

    // Project management platform URLs
    const projectManagementResult = resolveProjectManagementUrl(url);
    if (projectManagementResult) {
      return projectManagementResult;
    }

    // Content platform URLs
    const contentResult = resolveContentPlatformUrl(url);
    if (contentResult) {
      return contentResult;
    }

    // Social media platform URLs
    const socialMediaResult = resolveSocialMediaUrl(url);
    if (socialMediaResult) {
      return socialMediaResult;
    }

    // Tech platform URLs
    const techResult = resolveTechPlatformUrl(url);
    if (techResult) {
      return techResult;
    }

    // Default case
    return getDefaultUrlType();

  } catch {
    return getDefaultUrlType();
  }
}
