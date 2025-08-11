import { 
  UI_CONSTANTS, 
  MODAL_CONSTANTS 
} from '../../../constants';
import { HASHED_CLASSES } from '../../../utils/classUtils';
import { getTopRightContainer, updateContainerVisibility } from '../../utils/container-manager';
import { addHoverEffects } from './timer-effects';
import { handleTimerCancel } from './timer-actions';
import { updateTimer } from './timer-logic';

let countdownTimerElement: HTMLElement | null = null;

/**
 * Creates countdown timer element
 */
export function createCountdownTimerElement(): void {
  // Remove existing timer
  if (countdownTimerElement) {
    countdownTimerElement.remove();
    countdownTimerElement = null;
  }
  
  // Create countdown timer
  countdownTimerElement = document.createElement('div');
  countdownTimerElement.id = 'unwavering-focus-timer';
  countdownTimerElement.className = HASHED_CLASSES.COUNTDOWN_TIMER;
  countdownTimerElement.style.cssText = `
    background: rgba(220, 38, 38, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 8px 0 0 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    font-weight: 600;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    text-align: center;
    cursor: pointer;
    width: fit-content;
    transition: ${UI_CONSTANTS.TRANSITIONS.FAST};
    user-select: none;
    pointer-events: auto;
    align-self: flex-end;
    position: relative;
    z-index: ${MODAL_CONSTANTS.Z_INDEX.COUNTDOWN_TIMER};
  `;
  
  // Add hover effect
  addHoverEffects(countdownTimerElement);
  
  // Add click handler to cancel timer
  countdownTimerElement.addEventListener('click', () => {
    handleTimerCancel();
  });
  
  // Add to container (timer gets priority - first position)
  const container = getTopRightContainer();
  const pinnedTasksContainer = document.getElementById('unwavering-focus-pinned-tasks-container');
  
  if (pinnedTasksContainer) {
    // Insert timer before the pinned tasks container
    container.insertBefore(countdownTimerElement, pinnedTasksContainer);
  } else {
    // If no pinned tasks container exists, just insert at the beginning
    container.insertBefore(countdownTimerElement, container.firstChild);
  }
  
  updateContainerVisibility();
  updateTimer();
}

/**
 * Removes countdown timer element
 */
export function removeCountdownTimerElement(): void {
  if (countdownTimerElement) {
    // Remove timer from storage immediately to sync across all tabs
    chrome.storage.local.remove('countdownTimer');
    
    // Check for reduced motion preference for accessibility
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    
    if (prefersReducedMotion) {
      // Instant removal for users who prefer reduced motion
      countdownTimerElement.remove();
      countdownTimerElement = null;
      updateContainerVisibility();
    } else {
      // Simple slide-out animation
      countdownTimerElement.style.transition = 'transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)';
      countdownTimerElement.style.transform = 'translateX(100%)';
      
      setTimeout(() => {
        countdownTimerElement?.remove();
        countdownTimerElement = null;
        updateContainerVisibility();
      }, 200);
    }
  }
}

/**
 * Gets the countdown timer element
 */
export function getCountdownTimerElement(): HTMLElement | null {
  return countdownTimerElement;
}

/**
 * Sets the countdown timer element (for internal use)
 */
export function setCountdownTimerElement(element: HTMLElement | null): void {
  countdownTimerElement = element;
}
