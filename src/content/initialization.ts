import { FEATURE_CONSTANTS } from '../constants';
import {
  YouTubeDistractionBlocker,
  isYouTubePage,
} from '../utils/youtubeUtils';
import {
  VideoFocusManager,
  supportsVideoFocus,
} from '../utils/videoFocusUtils';
import { createPinnedTaskElements } from './ui/pinned-task';
import { createCountdownTimerElement } from './ui/countdown-timer';
import { startTimeTracking } from './utils/time-tracking';
import { startBoxBreathing } from './actions/breathing-exercise';
import { showTimerCompletionNotification } from './ui/countdown-timer';

// Global state
let youtubeBlocker: YouTubeDistractionBlocker | null = null;
let videoFocusManager: VideoFocusManager | null = null;

/**
 * Initialize the content script
 */
export async function initializeContentScript(): Promise<void> {
  // Clean up any existing overlays on page load/refresh
  document.addEventListener('DOMContentLoaded', () => {
    const existingOverlays = document.querySelectorAll(
      '[data-extension="unwavering-focus"]'
    );
    existingOverlays.forEach(overlay => overlay.remove());
  });

  // Add keyboard shortcut for breathing box (Alt+Shift+B)
  document.addEventListener('keydown', e => {
    if (e.altKey && e.shiftKey && e.key === 'B') {
      e.preventDefault();
      startBoxBreathing('');
    }
  });

  // Initialize YouTube distraction blocking if on YouTube
  if (isYouTubePage()) {
    await initializeYouTubeBlocker();
  }

  // Initialize video focus manager if supported
  if (supportsVideoFocus()) {
    await initializeVideoFocusManager();
  }

  // Check for existing pinned tasks on page load
  await checkExistingPinnedTasks();

  // Check for existing countdown timer on page load
  await checkExistingTimer();

  // Check for distracting domain and start timer if needed
  await checkDistractingDomain();

  console.log('Content script initialized on:', window.location.href);
}

/**
 * Initialize YouTube blocker
 */
async function initializeYouTubeBlocker(): Promise<void> {
  try {
    const data = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
    if (data?.config?.youtubeDistraction) {
      youtubeBlocker = new YouTubeDistractionBlocker(
        data.config.youtubeDistraction
      );
    } else {
      youtubeBlocker = new YouTubeDistractionBlocker();
    }
    youtubeBlocker.start();
  } catch (error) {
    console.error('Error initializing YouTube blocker:', error);
    youtubeBlocker = new YouTubeDistractionBlocker();
    youtubeBlocker.start();
  }
}

/**
 * Initialize video focus manager
 */
async function initializeVideoFocusManager(): Promise<void> {
  try {
    const data = await chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' });
    if (data?.config?.videoFocus) {
      videoFocusManager = new VideoFocusManager(data.config.videoFocus);
    } else {
      videoFocusManager = new VideoFocusManager({
        enabled: true,
        preventTabSwitch: true,
        preventMouseMovement: true,
        showIndicator: true,
        allowedDomains: [],
        autoDetectVideos: true,
      });
    }
    videoFocusManager.start();
  } catch (error) {
    console.error('Error initializing video focus manager:', error);
    videoFocusManager = new VideoFocusManager({
      enabled: true,
      preventTabSwitch: true,
      preventMouseMovement: true,
      showIndicator: true,
      allowedDomains: [],
      autoDetectVideos: true,
    });
    videoFocusManager.start();
  }
}

/**
 * Check for existing pinned tasks
 */
async function checkExistingPinnedTasks(): Promise<void> {
  try {
    const result = await chrome.storage.local.get([
      'pinnedTasks',
      'pinnedTask',
    ]);
    let tasks = result.pinnedTasks || [];

    // Migrate old single pinnedTask to new pinnedTasks array if needed
    if (!tasks.length && result.pinnedTask) {
      tasks = [result.pinnedTask.text || result.pinnedTask];
      await chrome.storage.local.set({ pinnedTasks: tasks });
      await chrome.storage.local.remove('pinnedTask');
    }

    if (tasks.length > 0) {
      createPinnedTaskElements(tasks);
    }
  } catch (error) {
    console.error('Error checking existing pinned tasks:', error);
  }
}

/**
 * Check for existing countdown timer
 */
async function checkExistingTimer(): Promise<void> {
  try {
    const result = await chrome.storage.local.get([
      'countdownTimer',
      'timerCompletionOverlay',
    ]);

    if (result.countdownTimer) {
      const { startTime, remainingSeconds } = result.countdownTimer;
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const actualRemainingSeconds = Math.max(
        0,
        remainingSeconds - elapsedSeconds
      );

      if (actualRemainingSeconds > 0) {
        createCountdownTimerElement();
      } else {
        await chrome.storage.local.remove('countdownTimer');
      }
    }

    if (result.timerCompletionOverlay === true) {
      showTimerCompletionNotification();
    }
  } catch (error) {
    console.error('Error checking existing timer:', error);
  }
}

/**
 * Check for distracting domain
 */
async function checkDistractingDomain(): Promise<void> {
  try {
    const response = await chrome.runtime.sendMessage({
      type: FEATURE_CONSTANTS.MESSAGE_TYPES.CHECK_DISTRACTING_DOMAIN,
      url: window.location.href,
    });

    if (response?.shouldBlock) {
      window.history.back();
    } else if (response?.shouldShowOverlay) {
      const rootDomain = getRootDomain(window.location.href);
      startTimeTracking(rootDomain);
    }
  } catch (error) {
    console.error('Error checking distracting domain:', error);
  }
}

/**
 * Get the root domain for tracking
 */
function getRootDomain(url: string): string {
  try {
    const { hostname } = new URL(url);
    const parts = hostname.split('.');
    if (parts.length > 2) {
      return parts.slice(-2).join('.');
    }
    return hostname;
  } catch {
    return url;
  }
}

/**
 * Get YouTube blocker instance
 */
export function getYouTubeBlocker(): YouTubeDistractionBlocker | null {
  return youtubeBlocker;
}

/**
 * Get video focus manager instance
 */
export function getVideoFocusManager(): VideoFocusManager | null {
  return videoFocusManager;
}

/**
 * Clean up managers
 */
export function cleanupManagers(): void {
  if (youtubeBlocker) {
    youtubeBlocker.stop();
  }
  if (videoFocusManager) {
    videoFocusManager.stop();
  }
}
