import { getSearchUrl } from './utils/urlUtils';
import { YouTubeDistractionBlocker, isYouTubePage } from './utils/youtubeUtils';
import styles from './content.css';

// YouTube Distraction Blocker instance
let youtubeBlocker: YouTubeDistractionBlocker | null = null;

// Distraction Blocker Overlay
class DistractionBlocker {
  private overlay: HTMLElement | null = null;

  showOverlay(domain: string, remainingVisits: number) {
    // Remove existing overlay
    this.hideOverlay();

    // Create overlay
    this.overlay = document.createElement('div');
    this.overlay.className = styles['distraction-blocker-overlay'];
    this.overlay.innerHTML = `
      <div class="${styles['distraction-blocker-modal']}">
        <div class="${styles['modal-content']}">
          <p>You're about to visit <strong>${domain}</strong></p>
          <div class="${styles['visits-info']}">
            <span class="${styles['visits-remaining']}">${remainingVisits} visits remaining today</span>
          </div>
          <div class="${styles['modal-actions']}">
          <button class="${styles['btn-back']}" id="back-btn">Go Back</button>
          <button class="${styles['btn-continue']}" id="continue-btn">Continue to Site</button>
          </div>
        </div>
      </div>
    `;

    // Add event listeners
    const continueBtn = this.overlay.querySelector('#continue-btn');
    const backBtn = this.overlay.querySelector('#back-btn');

    continueBtn?.addEventListener('click', () => {
      this.hideOverlay();
      // Increment the counter and allow access
      chrome.runtime.sendMessage({ 
        type: 'INCREMENT_DISTRACTING_DOMAIN', 
        domain: domain 
      }).then(response => {
        console.log('Domain counter incremented:', response);
      }).catch(error => {
        console.error('Error incrementing domain counter:', error);
      });
    });

    backBtn?.addEventListener('click', () => {
      this.hideOverlay();
      // Go back in history or close tab
      if (window.history.length > 1) {
        window.history.back();
      } else {
        window.close();
      }
    });

    // Add to page
    document.body.appendChild(this.overlay);
  }

  hideOverlay() {
    if (this.overlay) {
      this.overlay.remove();
      this.overlay = null;
    }
  }
}

// Smart Search Management Modal
class SmartSearchModal {
  private modal: HTMLDivElement | null = null;
  private input: HTMLInputElement | null = null;

  constructor() {
    // Remove keyboard listener since it's now handled by command
    // this.init();
  }

  private init() {
    // Listen for keyboard shortcut - REMOVED, now handled by command
    // document.addEventListener('keydown', (e) => {
    //   if (e.altKey && e.shiftKey && e.key === 'S') {
    //     e.preventDefault();
    //     this.show();
    //   }
    // });
  }

  public show() {
    if (this.modal) {
      return;
    }

    this.modal = this.createModal();
    document.body.appendChild(this.modal);

    // Focus the input
    setTimeout(() => {
      this.input?.focus();
      
      // Pre-populate with selected text if any
      const selectedText = window.getSelection()?.toString().trim();
      if (selectedText) {
        this.input!.value = selectedText;
        this.input!.select();
      }
    }, 10);
  }

  private createModal(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.className = styles['smart-search-modal'];
    modal.innerHTML = `
      <div class="${styles['modal-overlay']}">
        <div class="${styles['modal-content']}">
            <input 
              type="text" 
              placeholder="Enter your search query..." 
              class="${styles['search-input']}"
              autocomplete="off"
            />
        </div>
      </div>
    `;

    // Add event listeners
    const input = modal.querySelector(`.${styles['search-input']}`) as HTMLInputElement;
    const overlay = modal.querySelector(`.${styles['modal-overlay']}`);

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.saveSearch();
      } else if (e.key === 'Escape') {
        this.hide();
      }
    });

    overlay?.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.hide();
      }
    });

    this.input = input;
    return modal;
  }

  private hide() {
    if (this.modal) {
      document.body.removeChild(this.modal);
      this.modal = null;
      this.input = null;
    }
  }

  private async saveSearch() {
    const query = this.input?.value.trim();
    if (!query) return;

    try {
      await chrome.runtime.sendMessage({ 
        type: 'SAVE_SEARCH', 
        query 
      });
      console.log('Search saved:', query);
      this.hide();
    } catch (error) {
      console.error('Error saving search:', error);
    }
  }
}

// Initialize the modal and distraction blocker
const smartSearchModal = new SmartSearchModal();
const distractionBlocker = new DistractionBlocker();

console.log('Content script loaded on:', window.location.href);

// Check for distracting domains on page load
chrome.runtime.sendMessage({ 
  type: 'CHECK_DISTRACTING_DOMAIN', 
  url: window.location.href 
}).then(response => {
  console.log('Distraction blocker response:', response);
  if (response && response.shouldBlock) {
    console.log('Redirecting to focus page');
    // Redirect to focus page
    window.location.href = chrome.runtime.getURL('focus-page.html');
  } else if (response && response.shouldShowOverlay) {
    console.log('Showing overlay for domain:', response.domain, 'with visits:', response.remainingVisits);
    // Show overlay with remaining visits
    distractionBlocker.showOverlay(response.domain, response.remainingVisits);
  } else {
    console.log('No distraction blocker action needed');
  }
}).catch(error => {
  console.error('Error checking distracting domain:', error);
});

// Initialize YouTube distraction blocking if on YouTube
if (isYouTubePage()) {
  console.log('YouTube page detected, initializing distraction blocker');
  // Get configuration from storage
  chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' }).then(data => {
    if (data && data.config && data.config.youtubeDistraction) {
      youtubeBlocker = new YouTubeDistractionBlocker(data.config.youtubeDistraction);
    } else {
      youtubeBlocker = new YouTubeDistractionBlocker();
    }
    youtubeBlocker.start();
  }).catch(error => {
    console.error('Error getting YouTube distraction config:', error);
    youtubeBlocker = new YouTubeDistractionBlocker();
    youtubeBlocker.start();
  });
}

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PLAY_EYE_CARE_END_SOUND') {
    try {
      const audio = new Audio(chrome.runtime.getURL('sounds/eye-care-beep.mp3'));
      audio.volume = message.volume || 0.5;
      
      // Add error handling for audio loading
      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
        sendResponse({ error: 'Failed to load audio file' });
      });
      
      audio.play().then(() => {
        sendResponse({ success: true });
      }).catch(error => {
        console.error('Error playing eye care end sound in content script:', error);
        // Try fallback - use system beep if available
        try {
          if (typeof window.navigator.vibrate === 'function') {
            window.navigator.vibrate(200); // Short vibration as fallback
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
        sendResponse({ error: 'Failed to play sound' });
      });
    } catch (error) {
      console.error('Error creating audio in content script:', error);
      sendResponse({ error: 'Failed to create audio' });
    }
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'PLAY_EYE_CARE_START_SOUND') {
    try {
      const audio = new Audio(chrome.runtime.getURL('sounds/eye-care-start.mp3'));
      audio.volume = message.volume || 0.5;
      
      // Add error handling for audio loading
      audio.addEventListener('error', (e) => {
        console.error('Audio loading error:', e);
        sendResponse({ error: 'Failed to load audio file' });
      });
      
      audio.play().then(() => {
        sendResponse({ success: true });
      }).catch(error => {
        console.error('Error playing eye care start sound in content script:', error);
        // Try fallback - use system beep if available
        try {
          if (typeof window.navigator.vibrate === 'function') {
            window.navigator.vibrate([100, 50, 100]); // Pattern vibration as fallback
          }
        } catch (fallbackError) {
          console.error('Fallback also failed:', fallbackError);
        }
        sendResponse({ error: 'Failed to play sound' });
      });
    } catch (error) {
      console.error('Error creating audio in content script:', error);
      sendResponse({ error: 'Failed to create audio' });
    }
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'SHOW_SMART_SEARCH_MODAL') {
    smartSearchModal.show();
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'CHECK_DISTRACTING_DOMAIN') {
    // Check if current page is a distracting domain
    chrome.runtime.sendMessage({ 
      type: 'CHECK_DISTRACTING_DOMAIN', 
      url: window.location.href 
    }).then(response => {
      if (response && response.shouldBlock) {
        // Redirect to focus page
        window.location.href = chrome.runtime.getURL('focus-page.html');
      } else if (response && response.shouldShowOverlay) {
        // Show overlay with remaining visits
        distractionBlocker.showOverlay(response.domain, response.remainingVisits);
      }
    }).catch(error => {
      console.error('Error checking distracting domain:', error);
    });
    return true;
  }

  if (message.type === 'UPDATE_YOUTUBE_DISTRACTION_CONFIG') {
    if (youtubeBlocker && isYouTubePage()) {
      youtubeBlocker.updateConfig(message.config);
      sendResponse({ success: true });
    } else {
      sendResponse({ error: 'YouTube blocker not available or not on YouTube' });
    }
    return true;
  }
}); 