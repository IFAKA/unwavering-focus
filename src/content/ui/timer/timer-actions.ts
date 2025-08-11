import { getCountdownTimerElement, setCountdownTimerElement } from './timer-element';
import { updateContainerVisibility } from '../../utils/container-manager';
import { showTimerCompletionNotification } from './timer-notification';

/**
 * Handles timer completion
 */
export function handleTimerCompletion(): void {
  // Store timer completion flag for cross-tab synchronization
  chrome.storage.local.set({ timerCompletionOverlay: true }, () => {
    // Show full-screen timer completion notification
    showTimerCompletionNotification();
  });
  
  // Remove timer from storage immediately to sync across all tabs
  chrome.storage.local.remove('countdownTimer');
  
  // Animate timer completion with slide-to-right animation
  const countdownTimerElement = getCountdownTimerElement();
  if (countdownTimerElement) {
    // Check for reduced motion preference for accessibility
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Instant removal for users who prefer reduced motion
      countdownTimerElement.remove();
      setCountdownTimerElement(null);
      updateContainerVisibility();
    } else {
      // Simple slide-out animation
      countdownTimerElement.style.transition = 'transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)';
      countdownTimerElement.style.transform = 'translateX(100%)';
      
      setTimeout(() => {
        countdownTimerElement?.remove();
        setCountdownTimerElement(null);
        updateContainerVisibility();
      }, 200);
    }
  }
}

/**
 * Handles timer cancellation
 */
export function handleTimerCancel(): void {
  const countdownTimerElement = getCountdownTimerElement();
  if (countdownTimerElement) {
    // Remove timer from storage immediately to sync across all tabs
    chrome.storage.local.remove('countdownTimer');
    
    // Check for reduced motion preference for accessibility
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Instant removal for users who prefer reduced motion
      countdownTimerElement.remove();
      setCountdownTimerElement(null);
      updateContainerVisibility();
    } else {
      // Quick success feedback (120ms) - subtle scale down
      countdownTimerElement.style.transition = 'transform 120ms cubic-bezier(0.25, 0.46, 0.45, 0.94)';
      countdownTimerElement.style.transform = 'scale(0.95)';
      
      // Brief success state, then slide to the right
      setTimeout(() => {
        // Check if element still exists before accessing its style
        if (countdownTimerElement) {
          // Slide to right animation (200ms) - hardware accelerated transform only
          countdownTimerElement.style.transition = 'transform 200ms cubic-bezier(0.0, 0.0, 0.2, 1)';
          countdownTimerElement.style.transform = 'translateX(100%) scale(0.95)';
          
          // Remove after animation completes
          setTimeout(() => {
            countdownTimerElement?.remove();
            setCountdownTimerElement(null);
            updateContainerVisibility();
          }, 200);
        }
      }, 120);
    }
  }
}
