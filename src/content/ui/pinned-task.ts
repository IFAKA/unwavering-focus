import { 
  UI_CONSTANTS
} from '../../constants';
import { HASHED_CLASSES } from '../../utils/classUtils';
import { IPinnedTask } from '../actions/task-manager';
import { getTopRightContainer, updateContainerVisibility } from '../utils/container-manager';
import { handleTaskCompletion } from './pinned-task-completion';

/**
 * Creates a pinned task element with entrance animation
 */
export function createPinnedTaskElementWithEntrance(taskData: IPinnedTask): void {
  // Remove existing pinned task elements
  const existingElements = document.querySelectorAll('[data-pinned-task]');
  existingElements.forEach(element => element.remove());
  
  if (!taskData || !taskData.text) {
    updateContainerVisibility();
    return;
  }
  
  // Get the top-right container
  const container = getTopRightContainer();
  
  // Create pinned task element
  const pinnedTaskElement = document.createElement('div');
  pinnedTaskElement.setAttribute('data-pinned-task', '0');
  pinnedTaskElement.className = HASHED_CLASSES.PINNED_TASK;
  
  // Set styles for pinned task element
  pinnedTaskElement.style.cssText = `
    max-width: 212px;
    background: ${UI_CONSTANTS.COLORS.BACKGROUND_SECONDARY};
    border: 1px solid ${UI_CONSTANTS.COLORS.BORDER_PRIMARY};
    border-radius: 12px 0 0 12px;
    padding: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    line-height: 1.4;
    word-wrap: break-word;
    white-space: pre-wrap;
    pointer-events: auto;
    position: relative;
    align-self: flex-end;
    transition: background-color 0.3s ease;
  `;

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.style.cssText = `
    position: relative;
  `;
  
  // Add checkbox positioned absolutely
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.style.cssText = `
    position: absolute;
    left: 0;
    top: 2px;
    margin: 0;
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: ${UI_CONSTANTS.COLORS.ACCENT_PRIMARY};
  `;
  
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      handleTaskCompletion(checkbox, pinnedTaskElement, taskData);
    }
  });
  
  // Add the text content
  const textContent = document.createElement('div');
  textContent.innerHTML = taskData.text;
  textContent.style.cssText = `
    line-height: 1.4;
    word-wrap: break-word;
    white-space: pre-wrap;
    text-indent: 24px;
  `;
  
  // Assemble the content
  contentWrapper.appendChild(checkbox);
  contentWrapper.appendChild(textContent);
  pinnedTaskElement.appendChild(contentWrapper);
  
  // Add to container
  container.appendChild(pinnedTaskElement);
  
  // Add scroll transparency functionality
  addScrollTransparency(pinnedTaskElement);
  
  updateContainerVisibility();
}

/**
 * Creates a pinned task element (for existing tasks on page load)
 */
export function createPinnedTaskElement(taskData: IPinnedTask): void {
  // Remove existing pinned task elements
  const existingElements = document.querySelectorAll('[data-pinned-task]');
  existingElements.forEach(element => element.remove());
  
  if (!taskData || !taskData.text) {
    updateContainerVisibility();
    return;
  }
  
  // Get the top-right container
  const container = getTopRightContainer();
  
  // Create pinned task element
  const pinnedTaskElement = document.createElement('div');
  pinnedTaskElement.setAttribute('data-pinned-task', '0');
  pinnedTaskElement.className = HASHED_CLASSES.PINNED_TASK;
  
  pinnedTaskElement.style.cssText = `
    max-width: 212px;
    background: ${UI_CONSTANTS.COLORS.BACKGROUND_SECONDARY};
    border: 1px solid ${UI_CONSTANTS.COLORS.BORDER_PRIMARY};
    border-radius: 12px 0 0 12px;
    padding: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    line-height: 1.4;
    word-wrap: break-word;
    white-space: pre-wrap;
    pointer-events: auto;
    position: relative;
    align-self: flex-end;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  `;

  // Create content wrapper
  const contentWrapper = document.createElement('div');
  contentWrapper.style.cssText = `
    position: relative;
  `;
  
  // Add checkbox positioned absolutely
  const checkbox = document.createElement('input');
  checkbox.type = 'checkbox';
  checkbox.style.cssText = `
    position: absolute;
    left: 0;
    top: 2px;
    margin: 0;
    width: 16px;
    height: 16px;
    cursor: pointer;
    accent-color: ${UI_CONSTANTS.COLORS.ACCENT_PRIMARY};
  `;
  
  checkbox.addEventListener('change', () => {
    if (checkbox.checked) {
      handleTaskCompletion(checkbox, pinnedTaskElement, taskData);
    }
  });
  
  // Add the text content
  const textContent = document.createElement('div');
  textContent.innerHTML = taskData.text;
  textContent.style.cssText = `
    line-height: 1.4;
    word-wrap: break-word;
    white-space: pre-wrap;
    text-indent: 24px;
  `;
  
  // Assemble the content
  contentWrapper.appendChild(checkbox);
  contentWrapper.appendChild(textContent);
  pinnedTaskElement.appendChild(contentWrapper);
  
  // Add to container
  container.appendChild(pinnedTaskElement);
  
  // Add scroll transparency functionality
  addScrollTransparency(pinnedTaskElement);
  
  updateContainerVisibility();
}

/**
 * Creates multiple pinned task elements
 */
export function createPinnedTaskElements(tasks: IPinnedTask[]): void {
  // Remove existing pinned task elements
  removePinnedTaskElements();
  
  // If no tasks, clean up and return
  if (!tasks || tasks.length === 0) {
    updateContainerVisibility();
    return;
  }
  
  // Create pinned task elements for each task
  tasks.forEach((taskData) => {
    if (taskData && taskData.text) {
      createPinnedTaskElementWithEntrance(taskData);
    }
  });
}

/**
 * Removes all pinned task elements
 */
export function removePinnedTaskElements(): void {
  const existingElements = document.querySelectorAll('[data-pinned-task]');
  existingElements.forEach(element => element.remove());
  
  // Clean up the pinned tasks container if it exists and has no children
  const pinnedTasksContainer = document.getElementById('unwavering-focus-pinned-tasks-container');
  if (pinnedTasksContainer && pinnedTasksContainer.children.length === 0) {
    pinnedTasksContainer.remove();
  }
  
  updateContainerVisibility();
}

/**
 * Removes pinned task elements
 */
export function removePinnedTaskElement(): void {
  const existingElements = document.querySelectorAll('[data-pinned-task]');
  existingElements.forEach(element => {
    // Clean up scroll listeners if they exist
    if (element.dataset.scrollListener === 'true') {
      // Remove scroll listener (we can't directly remove the specific listener,
      // but we can mark it for cleanup)
      element.dataset.scrollListener = 'false';
    }
    element.remove();
  });
}

/**
 * Adds scroll transparency functionality to a pinned task element
 */
function addScrollTransparency(pinnedTaskElement: HTMLElement): void {
  let scrollTimeout: ReturnType<typeof setTimeout>;
  const handleScroll = (): void => {
    // Make more transparent when scrolling
    pinnedTaskElement.style.background = 'rgba(28, 28, 30, 0.7)';
    pinnedTaskElement.style.backdropFilter = 'blur(5px)';
    
    // Clear existing timeout
    clearTimeout(scrollTimeout);
    
    // Return to normal opacity after scrolling stops
    scrollTimeout = setTimeout(() => {
      pinnedTaskElement.style.background = UI_CONSTANTS.COLORS.BACKGROUND_SECONDARY;
      pinnedTaskElement.style.backdropFilter = 'blur(10px)';
    }, 300);
  };
  
  // Add scroll listener
  window.addEventListener('scroll', handleScroll, { passive: true });
  
  // Store reference for cleanup
  pinnedTaskElement.dataset.scrollListener = 'true';
}
