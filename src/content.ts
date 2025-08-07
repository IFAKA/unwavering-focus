import styles from './content.css';
import { YouTubeDistractionBlocker, isYouTubePage } from './utils/youtubeUtils';
import { VideoFocusManager, supportsVideoFocus } from './utils/videoFocusUtils';

// YouTube Distraction Blocker instance
let youtubeBlocker: YouTubeDistractionBlocker | null = null;

// Video Focus Manager instance
let videoFocusManager: VideoFocusManager | null = null;

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
  private confirmation: HTMLDivElement | null = null;
  private isClosing: boolean = false; // Prevent multiple modals

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
    if (this.modal || this.isClosing) {
      return; // Prevent multiple modals
    }

    // Clean up any existing modals (in case of state corruption)
    this.cleanup();

    this.modal = this.createModal();
    document.body.appendChild(this.modal);

    // Animate in
    setTimeout(() => {
      if (this.modal) {
        this.modal.style.opacity = '1';
      }
    }, 10);

    // Focus the input
    setTimeout(() => {
      this.input?.focus();
      
      // Pre-populate with selected text if any
      const selectedText = window.getSelection()?.toString().trim();
      if (selectedText) {
        this.input!.value = selectedText;
        this.input!.select();
      }
    }, 50);
  }

  private createModal(): HTMLDivElement {
    const modal = document.createElement('div');
    modal.className = styles['smart-search-modal'];
    modal.style.opacity = '0';
    modal.style.transition = 'opacity 0.2s ease';
    modal.innerHTML = `
      <div class="${styles['modal-overlay']}">
        <div class="${styles['modal-content']}">
            <input 
              type="text" 
              placeholder="Enter your thought or idea..." 
              class="${styles['search-input']}"
              autocomplete="off"
              autofocus
            />
            <div class="${styles['input-info']}">
              <span class="${styles['search-count']}">Press Enter to save for later</span>
            </div>
        </div>
      </div>
    `;

    // Add event listeners
    const input = modal.querySelector(`.${styles['search-input']}`) as HTMLInputElement;
    const overlay = modal.querySelector(`.${styles['modal-overlay']}`);

    input?.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        this.saveThought();
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
    if (this.modal && !this.isClosing) {
      this.isClosing = true; // Prevent multiple close attempts
      
      // Add fade out animation
      this.modal.style.transition = 'opacity 0.2s ease';
      this.modal.style.opacity = '0';
      
      // Remove after animation completes
      setTimeout(() => {
        if (this.modal && this.modal.parentNode) {
          this.modal.parentNode.removeChild(this.modal);
          this.modal = null;
          this.input = null;
        }
        this.isClosing = false; // Reset flag
      }, 200);
    }
  }

  private cleanup() {
    // Force cleanup in case of state corruption
    if (this.modal && this.modal.parentNode) {
      this.modal.parentNode.removeChild(this.modal);
    }
    this.modal = null;
    this.input = null;
    this.isClosing = false;
  }

  private showConfirmation(query: string) {
    // Create confirmation element
    this.confirmation = document.createElement('div');
    this.confirmation.className = styles['save-confirmation'];
    this.confirmation.innerHTML = `
      <div class="${styles['confirmation-content']}">
        <div class="${styles['confirmation-header']}">
          <div class="${styles['confirmation-icon']}">✓</div>
          <div class="${styles['confirmation-title']}">Saved for later</div>
        </div>
        <div class="${styles['confirmation-query']}">"${query}"</div>
      </div>
    `;

    // Add to page
    document.body.appendChild(this.confirmation);

    // Animate in
    setTimeout(() => {
      this.confirmation?.classList.add(styles['confirmation-visible']);
    }, 10);

    // Remove after 3 seconds
    setTimeout(() => {
      this.hideConfirmation();
    }, 3000);
  }

  private hideConfirmation() {
    if (this.confirmation) {
      this.confirmation.classList.remove(styles['confirmation-visible']);
      setTimeout(() => {
        if (this.confirmation && this.confirmation.parentNode) {
          this.confirmation.parentNode.removeChild(this.confirmation);
          this.confirmation = null;
        }
      }, 300);
    }
  }

  private async saveThought() {
    const thought = this.input?.value.trim();
    if (!thought || this.isClosing) return; // Prevent multiple saves

    try {
      // Start the close animation immediately
      this.hide();
      
      await chrome.runtime.sendMessage({ 
        type: 'SAVE_SEARCH', 
        query: thought 
      });
      console.log('Thought saved:', thought);
      
      // Show confirmation immediately when modal starts closing
      this.showConfirmation(thought);
    } catch (error) {
      console.error('Error saving thought:', error);
      // Still hide modal even if there's an error
      this.hide();
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

// Initialize video focus manager if supported
if (supportsVideoFocus()) {
  console.log('Video platform detected, initializing video focus manager');
  chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' }).then(data => {
    if (data && data.config && data.config.videoFocus) {
      videoFocusManager = new VideoFocusManager(data.config.videoFocus);
    } else {
      videoFocusManager = new VideoFocusManager({
        enabled: true,
        preventTabSwitch: true,
        showIndicator: true,
        allowedDomains: [],
        autoDetectVideos: true
      });
    }
    videoFocusManager.start();
  }).catch(error => {
    console.error('Error getting video focus config:', error);
    videoFocusManager = new VideoFocusManager({
      enabled: true,
      preventTabSwitch: true,
      showIndicator: true,
      allowedDomains: [],
      autoDetectVideos: true
    });
    videoFocusManager.start();
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

  if (message.type === 'UPDATE_VIDEO_FOCUS_CONFIG') {
    if (videoFocusManager && supportsVideoFocus()) {
      videoFocusManager.updateConfig(message.config);
      sendResponse({ success: true });
    } else {
      sendResponse({ error: 'Video focus manager not available or not on supported platform' });
    }
    return true;
  }

  if (message.type === 'VIDEO_FOCUS_BLOCKED_TAB_SWITCH') {
    // Show a notification that tab switching was blocked
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      z-index: 999999;
      text-align: center;
      max-width: 300px;
    `;
    notification.innerHTML = `
              <div style="margin-bottom: 10px;">
          <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle;">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
          </svg>
        </div>
      <div>${message.message}</div>
      <div style="font-size: 14px; margin-top: 10px; opacity: 0.8;">
        Return to video tab to continue
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
    
    sendResponse({ success: true });
    return true;
  }
}); 