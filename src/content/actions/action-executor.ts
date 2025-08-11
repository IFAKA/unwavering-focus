import { FEATURE_CONSTANTS } from '../../constants';
import { saveThought } from './thought-manager';
import { pinTask, hasExistingPinnedTask } from './task-manager';
import { startBoxBreathing } from './breathing-exercise';
import { startTimer, hasExistingTimer } from './timer-manager';

export interface IActionResult {
  success: boolean;
  message?: string;
  error?: string;
}

export type ActionType = 'save-thought' | 'pin-task' | 'box-breathing' | 'timer';

export interface IActionContext {
  text: string;
  actionId: ActionType;
  inputValue: string;
}

/**
 * Executes an action based on the action ID and text
 */
export async function executeAction(actionId: ActionType, text: string): Promise<IActionResult> {
  try {
    switch (actionId) {
      case 'save-thought':
        return await executeSaveThought(text);
      case 'pin-task':
        return await executePinTask(text);
      case 'box-breathing':
        return executeBoxBreathing(text);
      case 'timer':
        return await executeTimer(text);
      default:
        return {
          success: false,
          error: `Unknown action: ${actionId}`
        };
    }
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

/**
 * Executes the save thought action
 */
async function executeSaveThought(text: string): Promise<IActionResult> {
  if (!text.trim()) {
    return {
      success: false,
      error: 'Text cannot be empty'
    };
  }
  
  try {
    saveThought(text);
    return {
      success: true,
      message: 'Thought saved successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to save thought'
    };
  }
}

/**
 * Executes the pin task action
 */
async function executePinTask(text: string): Promise<IActionResult> {
  const trimmedText = text.trim();
  if (!trimmedText) {
    return {
      success: false,
      error: 'Task text cannot be empty'
    };
  }
  
  try {
    // Check if a pinned task already exists
    const hasTask = await hasExistingPinnedTask();
    if (hasTask) {
      return {
        success: false,
        message: 'Task already pinned. Complete the current task first.'
      };
    }
    
    await pinTask(text);
    return {
      success: true,
      message: 'Task pinned to top-right corner'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to pin task'
    };
  }
}

/**
 * Executes the box breathing action
 */
function executeBoxBreathing(text: string): IActionResult {
  try {
    startBoxBreathing(text);
    return {
      success: true,
      message: 'Box breathing exercise started'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start box breathing'
    };
  }
}

/**
 * Executes the timer action
 */
async function executeTimer(text: string): Promise<IActionResult> {
  try {
    // Check if a timer already exists
    const hasTimer = await hasExistingTimer();
    if (hasTimer) {
      return {
        success: false,
        message: 'Timer already running. Cancel existing timer first.'
      };
    }
    
    await startTimer(text);
    return {
      success: true,
      message: 'Timer started successfully'
    };
  } catch (error) {
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to start timer'
    };
  }
}

/**
 * Determines the appropriate action based on input text
 */
export function determineAction(inputValue: string): ActionType {
  const trimmedValue = inputValue.trim();
  
  if (trimmedValue === '') {
    return 'box-breathing';
  }
  
  if (/^\d+$/.test(trimmedValue)) {
    return 'timer';
  }
  
  return 'save-thought';
}

/**
 * Gets the display text for an action
 */
export function getActionDisplayText(actionId: ActionType, inputValue: string): string {
  const trimmedValue = inputValue.trim();
  
  switch (actionId) {
    case 'box-breathing':
      return '🫁 Start Box Breathing';
    case 'timer':
      return `⏱️ Start ${trimmedValue}-minute Timer`;
    case 'save-thought':
      return '💭 Save Thought (double-enter to pin)';
    case 'pin-task':
      return '📌 Pin Task';
    default:
      return 'Execute Action';
  }
}

/**
 * Validates if an action can be executed
 */
export async function canExecuteAction(actionId: ActionType, inputValue: string): Promise<boolean> {
  try {
    switch (actionId) {
      case 'timer':
        const hasTimer = await hasExistingTimer();
        return !hasTimer;
      case 'pin-task':
        const hasTask = await hasExistingPinnedTask();
        return !hasTask;
      default:
        return true;
    }
  } catch (error) {
    console.error('Error checking if action can be executed:', error);
    return false;
  }
}

/**
 * Gets the disabled state for an action
 */
export async function isActionDisabled(actionId: ActionType, inputValue: string): Promise<boolean> {
  return !(await canExecuteAction(actionId, inputValue));
}

/**
 * Handles double-enter detection for pinning tasks
 * This function is specifically designed to handle the double-enter scenario
 * where the user wants to pin a task but there might already be one pinned
 */
export async function handleDoubleEnter(
  inputValue: string,
  lastEnterTime: number,
  doubleEnterTimeout: number
): Promise<IActionResult> {
  const currentTime = Date.now();
  
  if (inputValue && currentTime - lastEnterTime < doubleEnterTimeout) {
    // Double-enter detected: Pin Task
    return await executePinTask(inputValue);
  }
  
  // Single enter: Execute normal action
  const actionId = determineAction(inputValue);
  return await executeAction(actionId, inputValue);
}

/**
 * Handles double-enter specifically for pinning tasks with proper error handling
 * This function ensures that if there's already a pinned task, it shows an error
 * and doesn't execute the save thought action
 */
export async function handleDoubleEnterPinTask(
  inputValue: string,
  lastEnterTime: number,
  doubleEnterTimeout: number
): Promise<IActionResult> {
  const currentTime = Date.now();
  
  if (inputValue && currentTime - lastEnterTime < doubleEnterTimeout) {
    // Double-enter detected: Pin Task
    try {
      // Check if there's already a pinned task
      const hasTask = await hasExistingPinnedTask();
      if (hasTask) {
        return {
          success: false,
          message: 'Task already pinned. Complete the current task first.'
        };
      }
      
      // Pin the task
      await pinTask(inputValue);
      return {
        success: true,
        message: 'Task pinned to top-right corner'
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Failed to pin task'
      };
    }
  }
  
  // Single enter: Execute normal action
  const actionId = determineAction(inputValue);
  return await executeAction(actionId, inputValue);
}
