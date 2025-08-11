import { ANIMATION_CONSTANTS } from '../../constants';
import { createPinnedTaskElementWithEntrance } from '../ui/pinned-task';

export interface IPinnedTask {
  text: string;
  url?: string | null;
  source?: string;
  originalText?: string;
}

/**
 * Pins a task to the top-right corner
 */
export async function pinTask(text: string): Promise<void> {
  const trimmedText = text.trim();
  if (!trimmedText) return;
  
  // Parse the text to check if it's a highlight URL
  const parsed = parseHighlightUrl(trimmedText);
  
  // Get existing pinned tasks and check if there's already one
  const existingTasks = await getPinnedTasks();
  
  // Check if there's already a pinned task (limit to 1)
  if (existingTasks.length > 0) {
    throw new Error('There is already a task pinned. Complete it first.');
  }
  
  // Store the task with additional metadata if it's a highlight URL
  const taskData: IPinnedTask = parsed.isHighlightUrl ? {
    text: parsed.displayText,
    url: parsed.url,
    source: parsed.source,
    originalText: trimmedText
  } : {
    text: trimmedText
  };
  
  const updatedTasks = [taskData];
  
  // Store pinned tasks array in chrome.storage for cross-tab persistence
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ pinnedTasks: updatedTasks }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        // Create task with entrance animation after a short delay
        setTimeout(() => {
          createPinnedTaskElementWithEntrance(taskData);
        }, ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE + 100);
        resolve();
      }
    });
  });
}

/**
 * Checks if a pinned task already exists
 */
export async function hasExistingPinnedTask(): Promise<boolean> {
  const tasks = await getPinnedTasks();
  return tasks.length > 0;
}

/**
 * Gets all pinned tasks
 */
export async function getPinnedTasks(): Promise<IPinnedTask[]> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['pinnedTasks'], (result) => {
      const tasks = result.pinnedTasks || [];
      resolve(Array.isArray(tasks) ? tasks : []);
    });
  });
}

/**
 * Gets the current pinned task (first one if multiple exist)
 */
export async function getPinnedTask(): Promise<IPinnedTask | null> {
  const tasks = await getPinnedTasks();
  return tasks.length > 0 ? tasks[0] : null;
}

/**
 * Removes a specific pinned task by text content
 */
export async function removePinnedTask(taskText: string): Promise<void> {
  const tasks = await getPinnedTasks();
  const updatedTasks = tasks.filter(task => task.text !== taskText);
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ pinnedTasks: updatedTasks }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Removes all pinned tasks
 */
export async function removeAllPinnedTasks(): Promise<void> {
  return new Promise((resolve, reject) => {
    chrome.storage.local.remove('pinnedTasks', () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Updates the pinned task
 */
export async function updatePinnedTask(task: IPinnedTask): Promise<void> {
  const tasks = await getPinnedTasks();
  if (tasks.length === 0) {
    throw new Error('No pinned task to update');
  }
  
  const updatedTasks = [task];
  
  return new Promise((resolve, reject) => {
    chrome.storage.local.set({ pinnedTasks: updatedTasks }, () => {
      if (chrome.runtime.lastError) {
        reject(new Error(chrome.runtime.lastError.message));
      } else {
        resolve();
      }
    });
  });
}

/**
 * Completes the pinned task and navigates to URL if present
 */
export async function completePinnedTask(): Promise<void> {
  const task = await getPinnedTask();
  if (task && task.url) {
    window.location.href = task.url;
  }
  await removeAllPinnedTasks();
}

/**
 * Helper function to parse highlight URLs and extract text
 */
function parseHighlightUrl(text: string): { 
  isHighlightUrl: boolean; 
  displayText: string; 
  url: string | null; 
  source: string 
} {
  const trimmedText = text.trim();
  
  // Check if it's a URL with highlight fragment
  if (trimmedText.startsWith('http') && trimmedText.includes('#:~:text=')) {
    try {
      const url = new URL(trimmedText);
      const fragment = url.hash;
      
      // Extract text from #:~:text= parameter
      const textMatch = fragment.match(/#:~:text=(.+)$/);
      if (textMatch && textMatch[1]) {
        const encodedText = textMatch[1];
        const decodedText = decodeURIComponent(encodedText);
        
        // Determine the source based on the domain
        let source = 'Highlight';
        if (url.hostname.includes('gemini.google.com')) {
          source = 'Gemini Chat Highlight';
        } else if (url.hostname.includes('notion.so')) {
          source = 'Notion Highlight';
        } else if (url.hostname.includes('docs.google.com')) {
          source = 'Google Docs Highlight';
        } else if (url.hostname.includes('github.com')) {
          source = 'GitHub Highlight';
        }
        
        return {
          isHighlightUrl: true,
          displayText: decodedText,
          url: trimmedText,
          source
        };
      }
    } catch (error) {
      // If URL parsing fails, treat as regular text
    }
  }
  
  return {
    isHighlightUrl: false,
    displayText: trimmedText,
    url: null,
    source: ''
  };
}
