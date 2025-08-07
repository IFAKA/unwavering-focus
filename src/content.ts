import styles from './content.css';
import { YouTubeDistractionBlocker, isYouTubePage } from './utils/youtubeUtils';
import { VideoFocusManager, supportsVideoFocus } from './utils/videoFocusUtils';

// YouTube Distraction Blocker instance
let youtubeBlocker: YouTubeDistractionBlocker | null = null;

// Video Focus Manager instance
let videoFocusManager: VideoFocusManager | null = null;

// Clean up any existing overlays on page load/refresh
// REMOVE: DistractionBlocker class and all modal logic

// Create countdown timer in top right corner
let countdownTimer: HTMLElement | null = null;
let countdownInterval: ReturnType<typeof setInterval> | null = null;
let lastRemainingSeconds: number | null = null;

function createCountdownTimer() {
  if (countdownTimer) return;
  countdownTimer = document.createElement('div');
  countdownTimer.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: 999998;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: 1px;
  `;
  countdownTimer.textContent = 'Loading...';
  document.body.appendChild(countdownTimer);
}

function updateCountdown(remainingSeconds: number) {
  if (!countdownTimer) {
    createCountdownTimer();
  }
  lastRemainingSeconds = remainingSeconds;
  if (remainingSeconds <= 0) {
    countdownTimer!.textContent = `0' 00"`;
    countdownTimer!.style.background = 'rgba(220, 38, 38, 0.9)';
    setTimeout(() => {
      window.location.href = chrome.runtime.getURL('focus-page.html');
    }, 1000);
  } else {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    countdownTimer!.textContent = `${minutes}' ${seconds.toString().padStart(2, '0')}"`;
    countdownTimer!.style.background = remainingSeconds < 600 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(0, 0, 0, 0.8)';
  }
}

function startTimeTracking(domain: string) {
  // Clear existing interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  // Get initial time in seconds
  chrome.runtime.sendMessage({
    type: 'GET_DOMAIN_TIME_INFO',
    domain: domain
  }).then(response => {
    if (response && response.remainingMinutes !== undefined) {
      // Convert to seconds
      let remainingSeconds = Math.max(0, Math.round(response.remainingMinutes * 60));
      updateCountdown(remainingSeconds);
      // Start ticking every second
      countdownInterval = setInterval(() => {
        if (lastRemainingSeconds !== null) {
          updateCountdown(lastRemainingSeconds - 1);
        }
      }, 1000);
    }
  }).catch(error => {
    console.error('Error getting domain time info:', error);
  });
}

console.log('Content script loaded on:', window.location.href);

// Helper to get the root domain for tracking
function getRootDomain(url: string) {
  try {
    const { hostname } = new URL(url);
    // For domains like www.pinterest.com, return pinterest.com
    const parts = hostname.split('.');
    if (parts.length > 2) {
      return parts.slice(-2).join('.');
    }
    return hostname;
  } catch {
    return url;
  }
}

// On page load, check for distracting domain and start timer if needed
chrome.runtime.sendMessage({ 
  type: 'CHECK_DISTRACTING_DOMAIN', 
  url: window.location.href 
}).then(response => {
  const rootDomain = getRootDomain(window.location.href);
  if (response && response.shouldBlock) {
    window.location.href = chrome.runtime.getURL('focus-page.html');
  } else if (response && response.shouldShowOverlay) {
    startTimeTracking(rootDomain);
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

// Track if this is a reload vs navigation
let isReload = false;

// Detect if this is a reload (not navigation)
if (performance.getEntriesByType('navigation').length > 0) {
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  isReload = navigationEntry.type === 'reload';
}

// If it's a reload, clear the modal state for this domain
if (isReload) {
  const rootDomain = getRootDomain(window.location.href);
  chrome.runtime.sendMessage({
    type: 'CLEAR_MODAL_STATE',
    domain: rootDomain
  }).catch(error => {
    console.error('Error clearing modal state:', error);
  });
}

// Clean up overlays when page is about to unload
window.addEventListener('beforeunload', () => {
  // Also clean up any managers
  if (youtubeBlocker) {
    youtubeBlocker.stop();
  }
  if (videoFocusManager) {
    videoFocusManager.stop();
  }
  // Clean up countdown timer
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  if (countdownTimer) {
    countdownTimer.remove();
  }
});

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
    // REMOVE: smartSearchModal.show();
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
        // REMOVE: distractionBlocker.showOverlay(response.domain, response.remainingVisits);
        startTimeTracking(response.domain);
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