// Storage Constants
export const STORAGE_CONSTANTS = {
  // Chrome storage keys
  KEYS: {
    SAVED_SEARCHES: 'savedSearches',
    DISTRACTING_DOMAINS: 'distractingDomains',
    HABIT_ENTRIES: 'habitEntries',
    CONFIG: 'config',
    TAB_COUNT: 'tabCount',
    NEXT_EYE_CARE_ALARM: 'nextEyeCareAlarm',
    VIDEO_FOCUS_STATES: 'videoFocusStates',
    TAB_MODAL_STATES: 'tabModalStates',
  },
  
  // Default values
  DEFAULTS: {
    SAVED_SEARCHES: [],
    DISTRACTING_DOMAINS: [],
    HABIT_ENTRIES: [],
    TAB_COUNT: 0,
    EYE_CARE_SOUND_VOLUME: 0.5,
    TAB_LIMITER_MAX_TABS: 3,
  },
  
  // Storage limits
  LIMITS: {
    MAX_SAVED_SEARCHES: 100,
    MAX_DISTRACTING_DOMAINS: 50,
    MAX_HABIT_ENTRIES: 1000,
  },
} as const;
