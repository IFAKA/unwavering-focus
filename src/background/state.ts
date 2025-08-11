import StorageService from '../services/storage';
import { DEFAULT_CONFIG, VideoState } from '../types';

// Centralized shared state and singletons for background modules

export const storage = StorageService.getInstance();
export const defaultConfig = DEFAULT_CONFIG;

// Video focus state tracking per tab
export const videoFocusStates: Map<number, VideoState> = new Map();

// Modal state tracking per tabId -> set of domains
export const tabModalStates: Map<number, Set<string>> = new Map();
