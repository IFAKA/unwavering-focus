// YouTube-specific distraction blocking utilities

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

const defaultConfig: YouTubeDistractionConfig = {
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
};

export class YouTubeDistractionBlocker {
  private config: YouTubeDistractionConfig;
  private observer: MutationObserver | null = null;
  private hiddenElements: Set<HTMLElement> = new Set();
  private intervalId: ReturnType<typeof setInterval> | null = null;

  constructor(config: Partial<YouTubeDistractionConfig> = {}) {
    this.config = { ...defaultConfig, ...config };
  }

  public start() {
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
    }, 2000);
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
    
    // Check if we're on a video page
    if (url.includes('youtube.com/watch')) {
      this.hideVideoPageElements();
    }
    
    // Check if we're on a search results page
    if (url.includes('youtube.com/results')) {
      this.hideSearchPageElements();
    }
    
    // Hide common elements on all YouTube pages
    this.hideCommonElements();
  }

  private hideVideoPageElements() {
    // Hide elements by ID
    const elementsToHide = [
      { id: 'secondary', config: 'hideSecondary' },
      { id: 'masthead-container', config: 'hideMasthead' },
      { id: 'owner', config: 'hideOwner' },
      { id: 'button-shape', config: 'hideButtonShape' },
      { id: 'author-thumbnail', config: 'hideAuthorThumbnail' },
      { id: 'sections', config: 'hideSections' }
    ];

    elementsToHide.forEach(({ id, config }) => {
      if (this.config[config as keyof YouTubeDistractionConfig]) {
        const element = document.getElementById(id);
        if (element && !this.hiddenElements.has(element)) {
          console.log(`YouTube Distraction Blocker: Hiding element with id "${id}"`);
          this.hideElement(element, config as keyof YouTubeDistractionConfig);
        } else if (!element) {
          console.log(`YouTube Distraction Blocker: Element with id "${id}" not found`);
        }
      }
    });

    // Hide segmented-like-dislike-button-view-model elements
    if (this.config.hideSegmentedButtons) {
      const segmentedButtons = document.querySelectorAll('segmented-like-dislike-button-view-model');
      segmentedButtons.forEach(button => {
        if (!this.hiddenElements.has(button as HTMLElement)) {
          this.hideElement(button as HTMLElement, 'hideSegmentedButtons');
        }
      });
    }

    // Hide specific button elements (Download, Thanks, Clip)
    if (this.config.hideButtonShape) {
      const buttons = document.querySelectorAll('yt-button-view-model');
      buttons.forEach(button => {
        const buttonText = button.textContent?.toLowerCase();
        if (buttonText && (buttonText.includes('download') || buttonText.includes('thanks') || buttonText.includes('clip'))) {
          if (!this.hiddenElements.has(button as HTMLElement)) {
            this.hideElement(button as HTMLElement, 'hideButtonShape');
          }
        }
      });
    }

    // Also hide elements by class names that might contain distracting content
    if (this.config.hideSecondary) {
      const secondaryElements = document.querySelectorAll('[class*="secondary"], [class*="related"], [class*="recommendations"], [id*="secondary"], [id*="related"]');
      secondaryElements.forEach(element => {
        const elementText = element.textContent?.toLowerCase();
        if (elementText && (elementText.includes('recommended') || elementText.includes('related') || elementText.includes('next'))) {
          if (!this.hiddenElements.has(element as HTMLElement)) {
            console.log(`YouTube Distraction Blocker: Hiding secondary element by class/id selector`);
            this.hideElement(element as HTMLElement);
          }
        }
      });
      
      // Additional selectors for YouTube's specific structure
      const additionalSelectors = [
        'ytd-watch-next-secondary-results-renderer',
        'ytd-watch-next-secondary-results-renderer #contents',
        '#secondary #contents',
        '#secondary ytd-watch-next-secondary-results-renderer',
        'ytd-watch-next-secondary-results-renderer #items'
      ];
      
      additionalSelectors.forEach(selector => {
        const elements = document.querySelectorAll(selector);
        elements.forEach(element => {
          if (!this.hiddenElements.has(element as HTMLElement)) {
            console.log(`YouTube Distraction Blocker: Hiding element with selector "${selector}"`);
            this.hideElement(element as HTMLElement, 'hideSecondary');
          }
        });
      });
    }
  }

  private hideSearchPageElements() {
    // Hide grid-shelf-view-model elements
    if (this.config.hideGridShelf) {
      const gridShelves = document.querySelectorAll('grid-shelf-view-model');
      gridShelves.forEach(shelf => {
        if (!this.hiddenElements.has(shelf as HTMLElement)) {
          this.hideElement(shelf as HTMLElement, 'hideGridShelf');
        }
      });
    }

    // Hide ytd-mini-guide-renderer elements
    if (this.config.hideMiniGuide) {
      const miniGuides = document.querySelectorAll('ytd-mini-guide-renderer');
      miniGuides.forEach(guide => {
        if (!this.hiddenElements.has(guide as HTMLElement)) {
          this.hideElement(guide as HTMLElement, 'hideMiniGuide');
        }
      });
    }
  }

  private hideCommonElements() {
    // Hide elements by ID that appear on multiple page types
    const commonElements = [
      { id: 'start', config: 'hideStart' },
      { id: 'buttons', config: 'hideButtons' }
    ];

    commonElements.forEach(({ id, config }) => {
      if (this.config[config as keyof YouTubeDistractionConfig]) {
        const element = document.getElementById(id);
        if (element && !this.hiddenElements.has(element)) {
          this.hideElement(element, config as keyof YouTubeDistractionConfig);
        }
      }
    });
  }

  private hideElement(element: HTMLElement, setting?: keyof YouTubeDistractionConfig) {
    // Store original display style
    const originalDisplay = element.style.display;
    const originalVisibility = element.style.visibility;
    
    // Hide the element
    element.style.display = 'none';
    element.style.visibility = 'hidden';
    
    // Store reference for potential restoration
    this.hiddenElements.add(element);
    
    // Add a data attribute to mark as hidden by our extension
    element.setAttribute('data-unwavering-focus-hidden', 'true');
    element.setAttribute('data-original-display', originalDisplay);
    element.setAttribute('data-original-visibility', originalVisibility);
    
    // Track which setting caused this element to be hidden
    if (setting) {
      element.setAttribute('data-hidden-by', setting);
    }
  }

  private restoreHiddenElements() {
    this.hiddenElements.forEach(element => {
      if (element.hasAttribute('data-unwavering-focus-hidden')) {
        this.restoreElement(element);
      }
    });
  }

  public updateConfig(newConfig: Partial<YouTubeDistractionConfig>) {
    const oldConfig = { ...this.config };
    this.config = { ...this.config, ...newConfig };
    
    // Check which settings changed
    const changedSettings = Object.keys(newConfig) as (keyof YouTubeDistractionConfig)[];
    
    // Restore elements for settings that were turned off
    changedSettings.forEach(setting => {
      if (oldConfig[setting] && !this.config[setting]) {
        this.restoreElementsForSetting(setting);
      }
    });
    
    // Re-apply hiding with new config
    this.hideDistractingElements();
  }

  private restoreElementsForSetting(setting: keyof YouTubeDistractionConfig) {
    // Find elements that were hidden by this specific setting and restore them
    this.hiddenElements.forEach(element => {
      const hiddenBy = element.getAttribute('data-hidden-by');
      if (hiddenBy === setting) {
        this.restoreElement(element);
      }
    });
  }

  private restoreElement(element: HTMLElement) {
    const originalDisplay = element.getAttribute('data-original-display') || '';
    const originalVisibility = element.getAttribute('data-original-visibility') || '';
    
    element.style.display = originalDisplay;
    element.style.visibility = originalVisibility;
    
    element.removeAttribute('data-unwavering-focus-hidden');
    element.removeAttribute('data-original-display');
    element.removeAttribute('data-original-visibility');
    element.removeAttribute('data-hidden-by');
    
    this.hiddenElements.delete(element);
  }
}

// Helper function to check if current page is YouTube
export function isYouTubePage(): boolean {
  return window.location.hostname === 'www.youtube.com' || 
         window.location.hostname === 'youtube.com' ||
         window.location.hostname === 'm.youtube.com';
}

// Helper function to get YouTube page type
export function getYouTubePageType(): 'video' | 'search' | 'other' {
  const url = window.location.href;
  
  if (url.includes('youtube.com/watch')) {
    return 'video';
  } else if (url.includes('youtube.com/results')) {
    return 'search';
  } else {
    return 'other';
  }
} 