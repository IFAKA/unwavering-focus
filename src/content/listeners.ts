import { FEATURE_CONSTANTS } from '../constants';
import { isYouTubePage } from '../utils/youtubeUtils';
import { supportsVideoFocus } from '../utils/videoFocusUtils';
import { createPinnedTaskElements, removePinnedTaskElements } from './ui/pinned-task';
import { createCountdownTimerElement, removeCountdownTimerElement } from './ui/countdown-timer';
import { getYouTubeBlocker, getVideoFocusManager } from './initialization';
import { showTimerCompletionNotification } from './ui/countdown-timer';
import { playAudioWithFallback } from './audio/audio-manager';
import { startBoxBreathing } from './actions/breathing-exercise';
import { startTimer } from './actions/timer-manager';
import { toggleModal } from './modal/modal-manager';

/**
 * Set up storage change listeners
 */
export function setupStorageListeners(): void {
  try {
    chrome.storage.onChanged.addListener((changes, namespace) => {
      if (namespace === 'local') {
        handlePinnedTasksChanges(changes);
        handleTimerChanges(changes);
      }
    });
  } catch (error) {
    console.error('Error setting up storage listeners:', error);
  }
}

/**
 * Handle pinned tasks storage changes
 */
function handlePinnedTasksChanges(changes: any): void {
  if (changes.pinnedTasks) {
    const { newValue } = changes.pinnedTasks;
    
    if (newValue && Array.isArray(newValue)) {
      if (newValue.length > 0) {
        createPinnedTaskElements(newValue);
      } else {
        removePinnedTaskElements();
      }
    } else if (!newValue) {
      removePinnedTaskElements();
    }
  }
  
  // Handle legacy pinnedTask changes
  if (changes.pinnedTask) {
    const { newValue } = changes.pinnedTask;
    
    if (newValue) {
      createPinnedTaskElements([newValue.text || newValue]);
    } else {
      removePinnedTaskElements();
    }
  }
}

/**
 * Handle timer storage changes
 */
function handleTimerChanges(changes: any): void {
  if (changes.countdownTimer) {
    const { newValue, oldValue } = changes.countdownTimer;
    
    if (newValue && newValue !== oldValue) {
      const { startTime, remainingSeconds } = newValue;
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const actualRemainingSeconds = Math.max(0, remainingSeconds - elapsedSeconds);
      
      if (actualRemainingSeconds > 0) {
        createCountdownTimerElement();
      } else {
        chrome.storage.local.remove('countdownTimer');
      }
    } else if (!newValue && oldValue) {
      removeCountdownTimerElement();
    }
  }
  
  if (changes.timerCompletionOverlay) {
    const { newValue } = changes.timerCompletionOverlay;
    
    if (newValue === true) {
      showTimerCompletionNotification();
    } else {
      const existingOverlay = document.getElementById('timer-completion-overlay');
      if (existingOverlay) {
        existingOverlay.remove();
        const styleElement = document.querySelector('style[data-timer-completion-style]');
        if (styleElement) {
          styleElement.remove();
        }
      }
    }
  }
}

/**
 * Set up message listeners
 */
export function setupMessageListeners(): void {
  try {
    chrome.runtime.onMessage.addListener(async (message, sender, sendResponse) => {
      try {
        await handleMessage(message, sendResponse);
        return true; // Keep message channel open for async response
      } catch (error) {
        console.error('Error in message listener:', error);
        sendResponse({ error: 'Internal error occurred' });
        return true;
      }
    });
  } catch (error) {
    console.error('Error setting up message listeners:', error);
  }
}

/**
 * Handle incoming messages
 */
async function handleMessage(message: any, sendResponse: (response: any) => void): Promise<void> {
  switch (message.type) {
    case 'PLAY_EYE_CARE_END_SOUND':
      playAudioWithFallback('sounds/eye-care-beep.mp3', message.volume || 0.5, sendResponse);
      break;
      
    case 'PLAY_EYE_CARE_START_SOUND':
      playAudioWithFallback('sounds/eye-care-start.mp3', message.volume || 0.5, sendResponse);
      break;
      
    case 'START_BREATHING_EXERCISE':
      startBoxBreathing(message.text || '');
      sendResponse({ success: true });
      break;
      
    case 'START_FOCUS_TIMER':
      startTimer(message.text || 'Focus Session');
      sendResponse({ success: true });
      break;
      
    case FEATURE_CONSTANTS.MESSAGE_TYPES.SHOW_SMART_SEARCH_MODAL:
      toggleModal();
      sendResponse({ success: true });
      break;
      
    case 'UPDATE_YOUTUBE_DISTRACTION_CONFIG':
      const youtubeBlocker = getYouTubeBlocker();
      if (youtubeBlocker && isYouTubePage()) {
        youtubeBlocker.updateConfig(message.config);
        sendResponse({ success: true });
      } else {
        sendResponse({ error: 'YouTube blocker not available or not on YouTube' });
      }
      break;
      
    case 'UPDATE_VIDEO_FOCUS_CONFIG':
      const videoFocusManager = getVideoFocusManager();
      if (videoFocusManager && supportsVideoFocus()) {
        videoFocusManager.updateConfig(message.config);
        sendResponse({ success: true });
      } else {
        sendResponse({ error: 'Video focus manager not available or not on supported platform' });
      }
      break;
      
    default:
      sendResponse({ error: 'Unknown message type' });
  }
}
