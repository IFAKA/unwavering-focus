import { 
  MODAL_CONSTANTS, 
  ANIMATION_CONSTANTS, 
  FEATURE_CONSTANTS,
  UI_CONSTANTS 
} from './constants';
import { YouTubeDistractionBlocker, isYouTubePage } from './utils/youtubeUtils';
import { VideoFocusManager, supportsVideoFocus } from './utils/videoFocusUtils';

// Smart Search Modal - Simple Implementation
let modal: HTMLElement | null = null;
let input: HTMLInputElement | null = null;
let isAnimating = false;
let focusAttempts = 0;
const MAX_FOCUS_ATTEMPTS = 10;

// Clean up any existing overlays on page load/refresh
document.addEventListener('DOMContentLoaded', () => {
  const existingOverlays = document.querySelectorAll('[data-extension="unwavering-focus"]');
  existingOverlays.forEach(overlay => overlay.remove());
});

// Listen for keyboard shortcut
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    toggleModal();
  }
});

function toggleModal() {
  if (modal && modal.style.display === 'flex') {
    closeModal();
  } else {
    openModal();
  }
}

function openModal() {
  if (isAnimating) return;
  isAnimating = true;
  focusAttempts = 0;
  
  // Ensure we're not in a restricted page context
  if (window.location.protocol === 'chrome:' || window.location.protocol === 'chrome-extension:') {
    console.warn('Modal cannot be opened on restricted pages');
    isAnimating = false;
    return;
  }
  
  // Create modal if it doesn't exist
  if (!modal) {
    createModal();
  } else {
    // Reset content to ensure we have a fresh input
    resetModalContent();
  }
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Set animation based on user preference
  if (prefersReducedMotion) {
    // Instant animation for users who prefer reduced motion
    modal!.style.transition = 'none';
    const content = modal!.querySelector('#modal-content') as HTMLElement;
    content.style.transition = 'none';
    
    // Show modal instantly
    modal!.style.display = 'block';
    modal!.style.opacity = ANIMATION_CONSTANTS.OPACITY.VISIBLE.toString();
    content.style.transform = MODAL_CONSTANTS.TRANSFORM.FINAL;
    
    // Focus immediately
    attemptFocus();
  } else {
    // Smooth animation with spring-like easing for natural motion
    modal!.style.transition = `opacity ${ANIMATION_CONSTANTS.TIMING.QUICK_OPEN}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
    const content = modal!.querySelector('#modal-content') as HTMLElement;
    content.style.transition = `transform ${ANIMATION_CONSTANTS.TIMING.QUICK_OPEN}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
    
    // Show modal
    modal!.style.display = 'block';
    modal!.style.opacity = ANIMATION_CONSTANTS.OPACITY.HIDDEN.toString();
    
    // Animate in with spring-like motion
    requestAnimationFrame(() => {
      modal!.style.opacity = ANIMATION_CONSTANTS.OPACITY.VISIBLE.toString();
      content.style.transform = MODAL_CONSTANTS.TRANSFORM.FINAL;
      
      // Start focus attempts immediately after animation starts
      attemptFocus();
    });
  }
}

function attemptFocus() {
  if (focusAttempts >= MAX_FOCUS_ATTEMPTS) {
    console.warn('Failed to focus input after maximum attempts');
    isAnimating = false;
    return;
  }
  
  focusAttempts++;
  
  // Try to focus the input
  if (input && input.offsetParent !== null) { // Check if input is visible
    try {
      input.focus();
      
      // If there's text, select all of it for easy replacement
      if (input.value) {
        input.select();
      } else {
        // If no text, just place cursor at the end
        input.setSelectionRange(input.value.length, input.value.length);
      }
      
      isAnimating = false;
      return;
    } catch (error) {
      console.warn('Focus attempt failed:', error);
    }
  }
  
  // If focus failed, try again using requestAnimationFrame for better timing
  if (focusAttempts <= 3) {
    // First few attempts use requestAnimationFrame for immediate response
    requestAnimationFrame(attemptFocus);
  } else {
    // Later attempts use setTimeout with increasing delays
    setTimeout(attemptFocus, Math.min(50 * focusAttempts, 200));
  }
}

function closeModal() {
  if (isAnimating) return;
  isAnimating = true;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Instant close for users who prefer reduced motion
    modal!.style.display = 'none';
    resetModalContent();
    isAnimating = false;
  } else {
    // Smooth animation with spring-like easing for natural motion
    modal!.style.transition = `opacity ${ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE}ms ${ANIMATION_CONSTANTS.EASING.EASE_IN}`;
    const content = modal!.querySelector('#modal-content') as HTMLElement;
    content.style.transition = `transform ${ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE}ms ${ANIMATION_CONSTANTS.EASING.EASE_IN}`;
    
    // Animate out
    modal!.style.opacity = ANIMATION_CONSTANTS.OPACITY.HIDDEN.toString();
    content.style.transform = MODAL_CONSTANTS.TRANSFORM.INITIAL;
    
    // Hide after animation and reset content
    setTimeout(() => {
      modal!.style.display = 'none';
      resetModalContent();
      isAnimating = false;
    }, ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE_DELAY);
  }
}

function resetModalContent() {
  if (!modal) return;
  
  const content = modal.querySelector('#modal-content') as HTMLElement;
  if (!content) return;
  
  // Clear content and recreate input
  content.innerHTML = '';
  
  // Get selected text if any
  const selectedText = window.getSelection()?.toString().trim() || '';
  
  // Recreate input
  input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter your thought...';
  input.autocomplete = 'off'; // Prevent browser autocomplete interference
  input.value = selectedText; // Pre-populate with selected text
  input.style.cssText = `
    width: 100%;
    padding: ${MODAL_CONSTANTS.INPUT.PADDING};
    border: ${MODAL_CONSTANTS.INPUT.BORDER_WIDTH} solid ${MODAL_CONSTANTS.CONTENT.BORDER_COLOR};
    border-radius: ${MODAL_CONSTANTS.INPUT.BORDER_RADIUS};
    font-size: ${MODAL_CONSTANTS.INPUT.FONT_SIZE};
    outline: none;
    background: ${UI_CONSTANTS.COLORS.BACKGROUND_PRIMARY};
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    box-sizing: border-box;
    transition: border-color 0.2s;
  `;
  
  // Add event listeners
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveThought();
    } else if (e.key === 'Escape') {
      closeModal();
    }
  });
  
  // Add to content
  content.appendChild(input);
  
  // Force a reflow to ensure the input is properly rendered
  input.offsetHeight;
}

function createModal() {
  // Create container
  modal = document.createElement('div');
  modal.setAttribute('data-extension', 'unwavering-focus');
  modal.style.cssText = `
    position: fixed;
    top: ${MODAL_CONSTANTS.POSITION.TOP};
    left: ${MODAL_CONSTANTS.POSITION.LEFT};
    width: ${MODAL_CONSTANTS.POSITION.WIDTH};
    height: ${MODAL_CONSTANTS.POSITION.HEIGHT};
    background: rgba(0, 0, 0, ${MODAL_CONSTANTS.STYLING.BACKGROUND_OPACITY});
    backdrop-filter: blur(${MODAL_CONSTANTS.STYLING.BACKDROP_BLUR});
    display: none;
    z-index: ${MODAL_CONSTANTS.Z_INDEX.MODAL};
    opacity: ${ANIMATION_CONSTANTS.OPACITY.HIDDEN};
    transition: opacity ${ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE}ms ${ANIMATION_CONSTANTS.EASING.EASE_OUT};
  `;
  
  // Create content
  const content = document.createElement('div');
  content.id = 'modal-content';
  content.style.cssText = `
    position: absolute;
    top: ${MODAL_CONSTANTS.GOLDEN_RATIO.VERTICAL_OFFSET};
    left: ${MODAL_CONSTANTS.GOLDEN_RATIO.HORIZONTAL_CENTER};
    transform: ${MODAL_CONSTANTS.TRANSFORM.INITIAL};
    background: ${MODAL_CONSTANTS.CONTENT.BACKGROUND_COLOR};
    border-radius: ${MODAL_CONSTANTS.STYLING.BORDER_RADIUS};
    padding: ${MODAL_CONSTANTS.STYLING.PADDING};
    width: ${MODAL_CONSTANTS.STYLING.WIDTH_PERCENTAGE};
    max-width: ${MODAL_CONSTANTS.STYLING.MAX_WIDTH};
    transition: transform ${ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE}ms ${ANIMATION_CONSTANTS.EASING.EASE_OUT};
    box-shadow: ${MODAL_CONSTANTS.CONTENT.BOX_SHADOW};
  `;
  
  // Get selected text if any
  const selectedText = window.getSelection()?.toString().trim() || '';
  
  // Create input
  input = document.createElement('input');
  input.type = 'text';
  input.placeholder = 'Enter your thought...';
  input.autocomplete = 'off'; // Prevent browser autocomplete interference
  input.value = selectedText; // Pre-populate with selected text
  input.style.cssText = `
    width: 100%;
    padding: ${MODAL_CONSTANTS.INPUT.PADDING};
    border: ${MODAL_CONSTANTS.INPUT.BORDER_WIDTH} solid ${MODAL_CONSTANTS.CONTENT.BORDER_COLOR};
    border-radius: ${MODAL_CONSTANTS.INPUT.BORDER_RADIUS};
    font-size: ${MODAL_CONSTANTS.INPUT.FONT_SIZE};
    outline: none;
    background: ${UI_CONSTANTS.COLORS.BACKGROUND_PRIMARY};
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    box-sizing: border-box;
    transition: border-color 0.2s;
  `;
  
  // Add event listeners
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') {
      saveThought();
    } else if (e.key === 'Escape') {
      closeModal();
    }
  });
  
  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      closeModal();
    }
  });
  
  // Assemble
  content.appendChild(input);
  modal.appendChild(content);
  document.body.appendChild(modal);
}

function saveThought() {
  const text = input!.value.trim();
  if (!text) return;
  
  // Save to storage
  chrome.runtime.sendMessage({
    type: FEATURE_CONSTANTS.MESSAGE_TYPES.SAVE_SEARCH,
    query: text
  }).then(() => {
    showConfirmation();
  }).catch(console.error);
}

function showConfirmation() {
  const content = modal!.querySelector('#modal-content') as HTMLElement;
  
  // Check for reduced motion preference
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Instant confirmation for users who prefer reduced motion
    content.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="margin-bottom: 16px;">
          <svg width="48" height="48" fill="none" stroke="${UI_CONSTANTS.COLORS.SUCCESS}" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div style="font-size: 18px; font-weight: 600; color: white;">Saved for later</div>
      </div>
    `;
    
    // Auto close after a short delay
    setTimeout(() => {
      closeModal();
    }, 800);
  } else {
    // Smooth animation with spring-like easing for natural motion
    input!.style.opacity = ANIMATION_CONSTANTS.OPACITY.HIDDEN.toString();
    input!.style.transition = `opacity ${ANIMATION_CONSTANTS.TIMING.CONFIRMATION_FADE_OUT}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
    
    setTimeout(() => {
      // Replace with confirmation
      content.innerHTML = `
        <div style="text-align: center; padding: 20px;">
          <div style="margin-bottom: 16px;">
            <svg width="48" height="48" fill="none" stroke="${UI_CONSTANTS.COLORS.SUCCESS}" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div style="font-size: 18px; font-weight: 600; color: white;">Saved for later</div>
      </div>
    `;
      
      // Fade in confirmation with spring-like motion
      content.style.opacity = ANIMATION_CONSTANTS.OPACITY.HIDDEN.toString();
      content.style.transition = `opacity ${ANIMATION_CONSTANTS.TIMING.CONFIRMATION_FADE_IN}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
      
      requestAnimationFrame(() => {
        content.style.opacity = ANIMATION_CONSTANTS.OPACITY.VISIBLE.toString();
      });
      
      // Auto close
      setTimeout(() => {
        closeModal();
      }, ANIMATION_CONSTANTS.TIMING.CONFIRMATION_AUTO_CLOSE);
    }, ANIMATION_CONSTANTS.TIMING.CONFIRMATION_FADE_OUT);
  }
}

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
    z-index: ${MODAL_CONSTANTS.Z_INDEX.COUNTDOWN_TIMER};
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
    type: FEATURE_CONSTANTS.MESSAGE_TYPES.GET_DOMAIN_TIME_INFO,
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
  type: FEATURE_CONSTANTS.MESSAGE_TYPES.CHECK_DISTRACTING_DOMAIN, 
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
let youtubeBlocker: YouTubeDistractionBlocker | null = null;
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
let videoFocusManager: VideoFocusManager | null = null;
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
    type: FEATURE_CONSTANTS.MESSAGE_TYPES.CLEAR_MODAL_STATE,
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
    playAudioWithFallback('sounds/eye-care-beep.mp3', message.volume || 0.5, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'PLAY_EYE_CARE_START_SOUND') {
    playAudioWithFallback('sounds/eye-care-start.mp3', message.volume || 0.5, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.type === FEATURE_CONSTANTS.MESSAGE_TYPES.SHOW_SMART_SEARCH_MODAL) {
    toggleModal();
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'CHECK_DISTRACTING_DOMAIN') {
    // Check if current page is a distracting domain
    chrome.runtime.sendMessage({ 
      type: FEATURE_CONSTANTS.MESSAGE_TYPES.CHECK_DISTRACTING_DOMAIN, 
      url: window.location.href 
    }).then(response => {
      if (response && response.shouldBlock) {
        // Redirect to focus page
        window.location.href = chrome.runtime.getURL('focus-page.html');
      } else if (response && response.shouldShowOverlay) {
        // Show overlay with remaining visits
        startTimeTracking(response.domain);
      }
    }).catch(error => {
      console.error('Error checking distracting domain:', error);
    });
    return true;
  }

  if (message.type === 'UPDATE_YOUTUBE_DISTRACTION_CONFIG') {
    console.log('Content script: Received UPDATE_YOUTUBE_DISTRACTION_CONFIG message:', message);
    if (youtubeBlocker && isYouTubePage()) {
      console.log('Content script: Updating YouTube blocker config');
      youtubeBlocker.updateConfig(message.config);
      sendResponse({ success: true });
    } else {
      console.log('Content script: YouTube blocker not available or not on YouTube');
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

// Improved audio playing function with better error handling and fallbacks
async function playAudioWithFallback(audioPath: string, volume: number, sendResponse: (response: any) => void) {
  try {
    // Check if we're on a restricted page
    if (window.location.protocol === 'chrome:' || window.location.protocol === 'chrome-extension:') {
      console.log('Audio playback not allowed on chrome:// URLs');
      sendResponse({ error: 'Audio not allowed on this page' });
      return;
    }

    // Check if user has interacted with the page (required for autoplay)
    if (!document.hasFocus() || document.visibilityState !== 'visible') {
      console.log('Page not focused or visible, using fallback methods');
      await tryFallbackMethods(sendResponse);
      return;
    }

    // Try to create and play audio
    const audio = new Audio(chrome.runtime.getURL(audioPath));
    audio.volume = volume;
    
    // Add error handling for audio loading
    audio.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      // Try fallback methods
      tryFallbackMethods(sendResponse);
    });
    
    // Try to play the audio
    try {
      await audio.play();
      sendResponse({ success: true });
    } catch (playError) {
      console.error('Error playing audio:', playError);
      // Try fallback methods
      await tryFallbackMethods(sendResponse);
    }
  } catch (error) {
    console.error('Error creating audio:', error);
    // Try fallback methods
    await tryFallbackMethods(sendResponse);
  }
}

// Fallback methods when audio fails
async function tryFallbackMethods(sendResponse: (response: any) => void) {
  // Method 1: Try vibration (if supported and user has interacted)
  try {
    if (typeof navigator.vibrate === 'function') {
      // Check if user has interacted with the page and vibration is allowed
      if (document.hasFocus() && document.visibilityState === 'visible') {
        // Use a shorter vibration pattern to avoid blocking
        navigator.vibrate(100);
        sendResponse({ success: true, method: 'vibration' });
        return;
      }
    }
  } catch (vibrationError) {
    console.error('Vibration failed:', vibrationError);
  }

  // Method 2: Try to create a simple beep using Web Audio API
  try {
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      const audioContext = new (AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if it's suspended (required for autoplay policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // Lower volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      sendResponse({ success: true, method: 'web-audio' });
      return;
    }
  } catch (webAudioError) {
    console.error('Web Audio API failed:', webAudioError);
  }

  // Method 3: Try to show a visual notification
  try {
    showVisualNotification();
    sendResponse({ success: true, method: 'visual' });
    return;
  } catch (visualError) {
    console.error('Visual notification failed:', visualError);
  }

  // If all methods fail
  sendResponse({ error: 'All audio methods failed' });
}

// Visual notification fallback
function showVisualNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 999999;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: fadeInOut 2s ease-in-out;
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-10px); }
      20% { opacity: 1; transform: translateY(0); }
      80% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-10px); }
    }
  `;
  
  notification.textContent = '👁️ Eye Care Reminder';
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  // Remove after animation
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 2000);
}