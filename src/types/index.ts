export interface SearchQuery {
  id: string;
  query: string;
  timestamp: number;
}

export interface DistractingDomain {
  domain: string;
  dailyLimit: number;
  currentCount: number;
  lastResetDate: string;
}

export interface HabitEntry {
  habitId: string;
  date: string;
  status: 'excellent' | 'good' | 'not-done';
}

export interface Habit {
  id: string;
  name: string;
  color: string;
}

export interface Pillar {
  id: string;
  quote: string;
  description: string;
  color: string;
}

export interface ExtensionConfig {
  smartSearch: { 
    enabled: boolean; 
    searchAllEnabled: boolean 
  };
  distractionBlocker: { 
    enabled: boolean; 
    domains: DistractingDomain[] 
  };
  eyeCare: { 
    enabled: boolean; 
    soundVolume: number 
  };
  tabLimiter: { 
    enabled: boolean;
    maxTabs: number; 
    excludedDomains: string[] 
  };
  focusPage: {
    motivationalMessage: string;
    habits: Habit[];
    pillars: Pillar[];
    dopamineTriggers: string[];
    reinforcementMessages: { 
      high: string; 
      medium: string; 
      low: string 
    };
  };
  youtubeDistraction: {
    hideSecondary: boolean;
    hideMasthead: boolean;
    hideOwner: boolean;
    hideButtonShape: boolean;
    hideAuthorThumbnail: boolean;
    hideSegmentedButtons: boolean;
    hideGridShelf: boolean;
    hideMiniGuide: boolean;
    hideSections: boolean;
    hideStart: boolean;
    hideButtons: boolean;
  };
  videoFocus: VideoFocusConfig;
}

export interface VideoFocusConfig {
  enabled: boolean;
  preventTabSwitch: boolean;
  showIndicator: boolean;
  allowedDomains: string[];
  autoDetectVideos: boolean;
}

export interface VideoState {
  isPlaying: boolean;
  platform: string;
  title?: string;
  duration?: number;
  currentTime?: number;
}

// Storage data interface
export interface StorageData {
  savedSearches: SearchQuery[];
  distractingDomains: DistractingDomain[];
  habitEntries: HabitEntry[];
  config: ExtensionConfig;
  tabCount: number;
  nextEyeCareAlarm?: number;
}

// Storage key type
export type StorageKey = keyof StorageData;

// Centralized default configuration
export const DEFAULT_CONFIG: ExtensionConfig = {
  smartSearch: { 
    enabled: true,
    searchAllEnabled: false 
  },
  distractionBlocker: { 
    enabled: true, 
    domains: [] 
  },
  eyeCare: { 
    enabled: true, 
    soundVolume: 0.5 
  },
  tabLimiter: { 
    enabled: true,
    maxTabs: 3, 
    excludedDomains: [] 
  },
  focusPage: {
    motivationalMessage: "Enfócate. Tu tiempo es oro.",
    habits: [],
    pillars: [],
    dopamineTriggers: [],
    reinforcementMessages: {
      high: "Your discipline forges your excellence.",
      medium: "Stay consistent. Progress builds momentum.",
      low: "Regain control. Small actions today build momentum."
    }
  },
  youtubeDistraction: {
    hideSecondary: true,
    hideMasthead: true,
    hideOwner: true,
    hideButtonShape: true,
    hideAuthorThumbnail: true,
    hideSegmentedButtons: true,
    hideGridShelf: true,
    hideMiniGuide: true,
    hideSections: true,
    hideStart: true,
    hideButtons: true
  },
  videoFocus: {
    enabled: true,
    preventTabSwitch: true,
    showIndicator: true,
    allowedDomains: [],
    autoDetectVideos: true
  }
}; 