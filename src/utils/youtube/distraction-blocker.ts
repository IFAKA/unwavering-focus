import { YouTubeDistractionConfig, defaultYouTubeConfig } from './types';
import { getYouTubePageType } from './page-detection';
import { hideVideoPageElements, hideSearchPageElements, hideCommonElements, restoreElement } from './element-hider';

export class YouTubeDistractionBlocker {
  private config: YouTubeDistractionConfig;
  private observer: MutationObserver | null = null;
  private hiddenElements: Set<HTMLElement> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<YouTubeDistractionConfig> = {}) {
    this.config = { ...defaultYouTubeConfig, ...config };
  }

  public start() {
    console.log('YouTube Distraction Blocker: Starting with config:', this.config);
    
    // Hide existing elements
    this.hideDistractingElements();
    
    // Set up observer for dynamically added elements
    this.setupObserver();
    
    // Also check periodically for new elements (but clear any existing interval first)
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
    this.intervalId = setInterval(() => {
      this.hideDistractingElements();
    }, 1000); // Check more frequently
  }

  public stop() {
    if (this.observer) {
      this.observer.disconnect();
      this.observer = null;
    }
    
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
    
    // Restore hidden elements
    this.restoreHiddenElements();
  }

  private setupObserver() {
    this.observer = new MutationObserver((mutations) => {
      let shouldCheck = false;
      
      for (const mutation of mutations) {
        if (mutation.type === 'childList' && mutation.addedNodes.length > 0) {
          shouldCheck = true;
          break;
        }
      }
      
      if (shouldCheck) {
        this.hideDistractingElements();
      }
    });

    this.observer.observe(document.body, {
      childList: true,
      subtree: true
    });
  }

  private hideDistractingElements() {
    const url = window.location.href;
    console.log('YouTube Distraction Blocker: Hiding distracting elements on URL:', url);
    console.log('Current config:', this.config);
    
    const pageType = getYouTubePageType();
    
    switch (pageType) {
      case 'video':
        hideVideoPageElements(this.config);
        break;
      case 'search':
        hideSearchPageElements(this.config);
        break;
      default:
        hideCommonElements(this.config);
        break;
    }
  }

  private restoreHiddenElements() {
    // Find all elements that were hidden by this blocker
    const hiddenElements = document.querySelectorAll('[data-unwavering-focus-hidden]');
    hiddenElements.forEach(el => {
      restoreElement(el as HTMLElement);
    });
  }

  public updateConfig(newConfig: Partial<YouTubeDistractionConfig>) {
    console.log('YouTube Distraction Blocker: Updating config from', this.config, 'to', newConfig);
    
    // Restore elements for settings that are being changed
    Object.keys(newConfig).forEach(key => {
      const setting = key as keyof YouTubeDistractionConfig;
      if (this.config[setting] !== newConfig[setting]) {
        this.restoreElementsForSetting(setting);
      }
    });
    
    // Update config
    this.config = { ...this.config, ...newConfig };
    
    // Re-hide elements with new config
    this.hideDistractingElements();
  }

  private restoreElementsForSetting(setting: keyof YouTubeDistractionConfig) {
    // Find elements that were hidden for this specific setting
    const hiddenElements = document.querySelectorAll(`[data-unwavering-focus-hidden="${setting}"]`);
    hiddenElements.forEach(el => {
      restoreElement(el as HTMLElement);
    });
  }
}
