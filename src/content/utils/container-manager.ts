import { MODAL_CONSTANTS } from '../../constants';

let topRightContainer: HTMLElement | null = null;

/**
 * Creates or gets the top-right container for stacking pinned tasks and timers
 */
export function getTopRightContainer(): HTMLElement {
  if (!topRightContainer) {
    topRightContainer = document.createElement('div');
    topRightContainer.id = 'unwavering-focus-top-right-container';
    topRightContainer.style.cssText = `
      position: fixed;
      top: 72px;
      right: 0;
      bottom: 0;
      z-index: ${MODAL_CONSTANTS.Z_INDEX.COUNTDOWN_TIMER};
      display: flex;
      gap: 12px;
      flex-direction: column;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(topRightContainer);
    
    // Add scroll listener for transparency effect
    addScrollTransparency();
  }
  return topRightContainer;
}

/**
 * Updates container visibility based on whether it has children
 */
export function updateContainerVisibility(): void {
  if (topRightContainer) {
    const hasTimer = document.getElementById('unwavering-focus-timer') !== null;
    const hasPinnedTask = document.querySelector('[data-pinned-task]') !== null;
    
    const hasChildren = hasTimer || hasPinnedTask;
    topRightContainer.style.display = hasChildren ? 'flex' : 'none';
  }
}

/**
 * Adds scroll transparency functionality to the container
 */
function addScrollTransparency(): void {
  if (!topRightContainer) return;
  
  let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
  let isScrolling = false;
  
  window.addEventListener('scroll', () => {
    if (!isScrolling) {
      isScrolling = true;
      topRightContainer!.style.opacity = '0.3'; // More transparent when scrolling
    }
    
    // Clear existing timeout
    if (scrollTimeout) {
      clearTimeout(scrollTimeout);
    }
    
    // Reset opacity after scrolling stops
    scrollTimeout = setTimeout(() => {
      isScrolling = false;
      topRightContainer!.style.opacity = '1'; // Full opacity when not scrolling
    }, 150); // 150ms delay after scroll stops
  });
}

/**
 * Gets the top-right container element
 */
export function getContainer(): HTMLElement | null {
  return topRightContainer;
}

/**
 * Removes the top-right container
 */
export function removeContainer(): void {
  if (topRightContainer) {
    topRightContainer.remove();
    topRightContainer = null;
  }
}

/**
 * Checks if the container exists
 */
export function hasContainer(): boolean {
  return topRightContainer !== null;
}

/**
 * Gets the container's current display state
 */
export function getContainerDisplayState(): string {
  if (!topRightContainer) return 'none';
  return topRightContainer.style.display || 'none';
}

/**
 * Sets the container's display state
 */
export function setContainerDisplayState(display: string): void {
  if (topRightContainer) {
    topRightContainer.style.display = display;
  }
}

/**
 * Gets the container's current opacity
 */
export function getContainerOpacity(): string {
  if (!topRightContainer) return '1';
  return topRightContainer.style.opacity || '1';
}

/**
 * Sets the container's opacity
 */
export function setContainerOpacity(opacity: string): void {
  if (topRightContainer) {
    topRightContainer.style.opacity = opacity;
  }
}
