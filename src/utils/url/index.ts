// Re-export all URL utilities for backward compatibility

// Types
export * from './url-types';

// Validation and domain functions
export {
  extractDomain,
  isHomepage,
  isSpecificContent,
  isDistractingDomain,
  shouldRedirect,
  isUrl,
  validateUrl,
  getDomainInfo,
  normalizeUrl,
  areUrlsEquivalent,
  formatUrlForDisplay
} from './url-validation';

// Search engine functions
export {
  getSearchUrl,
  getAvailableSearchEngines,
  extractSearchQuery,
  isSearchEngineResult
} from './search-engines';

// Re-export URL type detection (will be implemented in separate file)
export { detectUrlType } from './url-detection';
