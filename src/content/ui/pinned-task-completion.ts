import { UI_CONSTANTS } from '../../constants';
import { IPinnedTask } from '../actions/task-manager';
import { updateContainerVisibility } from '../utils/container-manager';

/**
 * Handles task completion with animations
 */
export function handleTaskCompletion(
  checkbox: HTMLInputElement, 
  pinnedTaskElement: HTMLElement, 
  taskData: IPinnedTask
): void {
  // Disable checkbox to prevent multiple clicks
  checkbox.disabled = true;
  
  // Enhanced completion animation with strikethrough
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReducedMotion) {
    // Remove task from storage and navigate immediately
    removeTaskFromStorage(taskData.text);
    if (taskData.url) {
      window.location.href = taskData.url;
    }
    pinnedTaskElement.remove();
    updateContainerVisibility();
  } else {
    // 1. Scale down feedback (120ms)
    pinnedTaskElement.style.transition = 'transform 0.12s cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    pinnedTaskElement.style.transform = 'scale(0.95)';
    
    // 2. Strikethrough animation (120ms)
    setTimeout(() => {
      const textContent = pinnedTaskElement.querySelector('div:last-child') as HTMLElement;
      if (textContent) {
        textContent.style.transition = 'text-decoration 0.12s cubic-bezier(0.4, 0.0, 0.2, 1)';
        textContent.style.textDecoration = 'line-through';
        textContent.style.textDecorationColor = UI_CONSTANTS.COLORS.TEXT_PRIMARY;
        textContent.style.textDecorationThickness = '2px';
      }
      
      // 3. Slide out to right animation (200ms)
      setTimeout(() => {
        pinnedTaskElement.style.transition = 'transform 0.2s cubic-bezier(0.4, 0.0, 0.2, 1)';
        pinnedTaskElement.style.transform = 'translateX(100%) scale(0.95)';
        
        // 4. After animation completes, navigate to URL and cleanup
        setTimeout(() => {
          // Remove task from storage
          removeTaskFromStorage(taskData.text);
          
          // Navigate to URL if present
          if (taskData.url) {
            window.location.href = taskData.url;
          }
          
          // Remove element and update visibility
          pinnedTaskElement.remove();
          updateContainerVisibility();
        }, 200);
      }, 120);
    }, 120);
  }
}

/**
 * Removes a task from storage by text content
 */
function removeTaskFromStorage(taskText: string): void {
  chrome.storage.local.get(['pinnedTasks'], (result) => {
    const tasks = result.pinnedTasks || [];
    const updatedTasks = tasks.filter((task: IPinnedTask) => task.text !== taskText);
    
    chrome.storage.local.set({ pinnedTasks: updatedTasks }, () => {
      if (chrome.runtime.lastError) {
        console.error('Error removing task from storage:', chrome.runtime.lastError);
      }
    });
  });
}
