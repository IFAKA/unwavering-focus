export interface SearchQuery {
  id: string;
  query: string;
  timestamp: number;
}

export interface DistractingDomain {
  domain: string;
}



export interface ExtensionConfig {
  smartSearch: { 
    enabled: boolean; 
    searchAllEnabled: boolean 
  };
  distractionBlocker: { 
    enabled: boolean; 
    domains: DistractingDomain[];
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