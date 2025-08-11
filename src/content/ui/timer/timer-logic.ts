import { getCountdownTimerElement, setCountdownTimerElement } from './timer-element';
import { updateContainerVisibility } from '../../utils/container-manager';
import { handleTimerCompletion } from './timer-actions';

/**
 * Updates the timer display
 */
export function updateTimer(): void {
  const countdownTimerElement = getCountdownTimerElement();
  if (!countdownTimerElement) return;
  
  // Calculate remaining time based on stored start time and current time
  chrome.storage.local.get(['countdownTimer'], (result) => {
    if (!result.countdownTimer) {
      // Timer was removed, clean up
      countdownTimerElement?.remove();
      setCountdownTimerElement(null);
      updateContainerVisibility();
      return;
    }
    
    const { startTime, remainingSeconds: originalRemainingSeconds } = result.countdownTimer;
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const actualRemainingSeconds = Math.max(0, originalRemainingSeconds - elapsedSeconds);
    
    if (actualRemainingSeconds <= 0) {
      handleTimerCompletion();
      return;
    }
    
    // Format as mm:ss
    const mins = Math.floor(actualRemainingSeconds / 60);
    const secs = actualRemainingSeconds % 60;
    countdownTimerElement.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    countdownTimerElement.title = 'Click to cancel timer';
    
    // Keep red background always
    countdownTimerElement.style.background = 'rgba(220, 38, 38, 0.9)';
    
    // Schedule next update in 1 second
    setTimeout(updateTimer, 1000);
  });
}
