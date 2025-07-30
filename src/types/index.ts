export interface SavedSearch {
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

export interface HabitEntry {
  habitId: string;
  date: string;
  status: 'excellent' | 'good' | 'not-done';
}

export interface TabLimiterConfig {
  maxTabs: number;
  excludedDomains: string[];
}

export interface EyeCareConfig {
  enabled: boolean;
  soundVolume: number;
  customSound?: string;
}

export interface YouTubeDistractionConfig {
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
}

export interface FocusPageConfig {
  motivationalMessage: string;
  habits: Habit[];
  pillars: Pillar[];
  reinforcementMessages: {
    high: string;
    medium: string;
    low: string;
  };
}

export interface ExtensionConfig {
  smartSearch: {
    enabled: boolean;
    searchAllEnabled: boolean;
  };
  distractionBlocker: {
    enabled: boolean;
    domains: DistractingDomain[];
  };
  eyeCare: EyeCareConfig;
  tabLimiter: TabLimiterConfig;
  focusPage: FocusPageConfig;
  youtubeDistraction: YouTubeDistractionConfig;
}

export interface StorageData {
  savedSearches: SavedSearch[];
  distractingDomains: DistractingDomain[];
  habitEntries: HabitEntry[];
  config: ExtensionConfig;
  eyeCareLastNotification?: number;
  nextEyeCareAlarm?: number;
  tabCount: number;
}

export type StorageKey = keyof StorageData; 