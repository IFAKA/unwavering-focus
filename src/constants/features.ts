// Feature Constants
export const FEATURE_CONSTANTS = {
  // Tab Limiter
  TAB_LIMITER: {
    DEFAULT_MAX_TABS: 3,
    MIN_MAX_TABS: 1,
    MAX_MAX_TABS: 10,
    CHECK_INTERVAL: 2000, // 2 seconds
  },
  
  // Eye Care
  EYE_CARE: {
    REMINDER_INTERVAL: 20 * 60 * 1000, // 20 minutes
    BREAK_DURATION: 20 * 1000, // 20 seconds
    GRACE_PERIOD: 20000, // 20 seconds
    DEFAULT_SOUND_VOLUME: 0.5,
    MIN_SOUND_VOLUME: 0.0,
    MAX_SOUND_VOLUME: 1.0,
  },
  
  // Distraction Blocker
  DISTRACTION_BLOCKER: {
    DEFAULT_DAILY_LIMIT: 30, // minutes
    MIN_DAILY_LIMIT: 5,
    MAX_DAILY_LIMIT: 480, // 8 hours
    CHECK_INTERVAL: 60000, // 1 minute
  },
  
  // Video Focus
  VIDEO_FOCUS: {
    CHECK_INTERVAL: 2000, // 2 seconds
    MIN_VIDEO_DURATION: 5000, // 5 seconds
    ALLOWED_DOMAINS: [
      'youtube.com',
      'netflix.com',
      'vimeo.com',
      'twitch.tv',
      'facebook.com',
      'instagram.com',
      'tiktok.com',
    ],
    EXCLUDED_DOMAINS: [
      'music.youtube.com', // YouTube Music - designed for audio
    ],
  },
  
  // Smart Search
  SMART_SEARCH: {
    MIN_QUERY_LENGTH: 1,
    MAX_QUERY_LENGTH: 1000,
    MAX_SAVED_ITEMS: 100,
    AUTO_REMOVE_AFTER_SEARCH: true,
  },
  
  // YouTube Distraction Blocking
  YOUTUBE_DISTRACTION: {
    SELECTORS: {
      SECONDARY: '#secondary',
      MASTHEAD: '#masthead',
      OWNER: '#owner',
      BUTTON_SHAPE: 'button[aria-label*="like"]',
      AUTHOR_THUMBNAIL: '#author-thumbnail',
      SEGMENTED_BUTTONS: 'ytd-segmented-like-dislike-button-renderer',
      GRID_SHELF: 'ytd-grid-shelf-renderer',
      MINI_GUIDE: '#guide-content',
      SECTIONS: 'ytd-rich-section-renderer',
      START: '#start',
      BUTTONS: 'ytd-button-renderer',
    },
  },
  

  
  // Keyboard Shortcuts
  KEYBOARD_SHORTCUTS: {
    SMART_SEARCH: 'Alt+Shift+I',
    COMMAND_NAME: 'open-smart-search',
  },
  
  // Message Types
  MESSAGE_TYPES: {
    SHOW_SMART_SEARCH_MODAL: 'SHOW_SMART_SEARCH_MODAL',
    SAVE_SEARCH: 'SAVE_SEARCH',
    GET_STORAGE_DATA: 'GET_STORAGE_DATA',

    SET_EYE_CARE_ALARM: 'SET_EYE_CARE_ALARM',
    CLEAR_EYE_CARE_ALARM: 'CLEAR_EYE_CARE_ALARM',
    UPDATE_TAB_COUNT: 'UPDATE_TAB_COUNT',
    BLOCK_DOMAIN: 'BLOCK_DOMAIN',
    UNBLOCK_DOMAIN: 'UNBLOCK_DOMAIN',
    CHECK_DISTRACTING_DOMAIN: 'CHECK_DISTRACTING_DOMAIN',
    CLEAR_MODAL_STATE: 'CLEAR_MODAL_STATE',
  },
} as const;
