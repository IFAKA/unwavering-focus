import { UI_CONSTANTS } from '../../constants';
import { closeModal } from './modal-manager';
import { executeAction, handleDoubleEnterPinTask as executeDoubleEnterPinTask, determineAction, getActionDisplayText } from '../actions/action-executor';

const DOUBLE_ENTER_TIMEOUT = 500;

export interface IKeyboardHandlerState {
  lastEnterTime: number;
  saveConfirmationTimeout: ReturnType<typeof setTimeout> | null;
  isProcessing: boolean;
}

let keyboardState: IKeyboardHandlerState = {
  lastEnterTime: 0,
  saveConfirmationTimeout: null,
  isProcessing: false
};

/**
 * Handles keyboard input for the modal
 */
export async function handleKeyboardInput(
  event: KeyboardEvent,
  input: HTMLTextAreaElement,
  actionButton: HTMLButtonElement
): Promise<void> {
  if (event.key === 'Enter' && !event.shiftKey) {
    event.preventDefault();
    
    if (keyboardState.isProcessing) {
      return; // Prevent multiple simultaneous processing
    }
    
    keyboardState.isProcessing = true;
    
    try {
      await handleEnterKey(input, actionButton);
    } finally {
      keyboardState.isProcessing = false;
    }
  } else if (event.key === 'Escape') {
    closeModal();
  }
}

/**
 * Handles the Enter key press with double-enter detection
 */
async function handleEnterKey(
  input: HTMLTextAreaElement,
  actionButton: HTMLButtonElement
): Promise<void> {
  const currentTime = Date.now();
  const inputValue = input.value.trim();
  const actionId = actionButton.dataset.actionId as string;
  
  // Check for double-enter (pin task)
  if (inputValue && actionId === 'save-thought' && 
      currentTime - keyboardState.lastEnterTime < DOUBLE_ENTER_TIMEOUT) {
    
    // Double-enter detected: Pin Task
    await processDoubleEnterPinTask(inputValue, actionButton);
    keyboardState.lastEnterTime = 0; // Reset
    return;
  }
  
  // Single enter: Execute normal action
  await handleSingleEnter(inputValue, actionId, actionButton);
  keyboardState.lastEnterTime = currentTime;
}

/**
 * Handles double-enter for pinning tasks
 */
async function processDoubleEnterPinTask(
  inputValue: string,
  actionButton: HTMLButtonElement
): Promise<void> {
  try {
    // Clear any pending save confirmation
    if (keyboardState.saveConfirmationTimeout) {
      clearTimeout(keyboardState.saveConfirmationTimeout);
      keyboardState.saveConfirmationTimeout = null;
    }
    
    // Use the new function that handles the double-enter logic properly
    const result = await executeDoubleEnterPinTask(inputValue, keyboardState.lastEnterTime, DOUBLE_ENTER_TIMEOUT);
    
    if (result.success) {
      showButtonSuccess(actionButton, '📌 Task Pinned!');
      setTimeout(() => closeModal(), 1000);
    } else {
      // Show error message in red on the button
      showButtonError(actionButton, result.message || result.error || 'Failed to pin task');
    }
    
  } catch (error) {
    console.error('Error handling double-enter pin task:', error);
    showButtonError(actionButton, 'Error pinning task');
  }
}

/**
 * Handles single enter key press
 */
async function handleSingleEnter(
  inputValue: string,
  actionId: string,
  actionButton: HTMLButtonElement
): Promise<void> {
  if (!actionId || actionButton.dataset.disabled === 'true') {
    return;
  }
  
  if (actionId === 'timer' && inputValue === '') {
    const result = await executeAction('timer', '25'); // Default 25 minutes
    if (result.success) {
      showButtonSuccess(actionButton, '⏱️ Timer Started!');
      setTimeout(() => closeModal(), 1000);
    } else {
      showButtonError(actionButton, result.error || 'Failed to start timer');
    }
  } else if (actionId === 'save-thought') {
    // For save-thought, delay the actual saving to allow for double-enter
    await handleSaveThoughtWithDelay(inputValue, actionButton);
  } else {
    const result = await executeAction(actionId as any, inputValue);
    if (result.success) {
      showButtonSuccess(actionButton, result.message || 'Action completed');
      setTimeout(() => closeModal(), 1000);
    } else {
      showButtonError(actionButton, result.error || 'Action failed');
    }
  }
}

/**
 * Handles save thought with delay to allow for double-enter
 */
async function handleSaveThoughtWithDelay(
  inputValue: string,
  actionButton: HTMLButtonElement
): Promise<void> {
  // Show immediate feedback
  const originalText = actionButton.textContent || '';
  showButtonSuccess(actionButton, '💭 Thought Saved! (press Enter again to pin)');
  
  // Set timeout to actually save the thought if no double-enter occurs
  keyboardState.saveConfirmationTimeout = setTimeout(async () => {
    try {
      const result = await executeAction('save-thought', inputValue);
      if (result.success) {
        showButtonSuccess(actionButton, '💭 Thought Saved!');
        setTimeout(() => closeModal(), 1000);
      } else {
        showButtonError(actionButton, result.error || 'Failed to save thought');
        setTimeout(() => resetButton(actionButton, originalText), 3000);
      }
    } catch (error) {
      console.error('Error saving thought:', error);
      showButtonError(actionButton, 'Error saving thought');
      setTimeout(() => resetButton(actionButton, originalText), 3000);
    }
  }, DOUBLE_ENTER_TIMEOUT);
}

/**
 * Shows an error message on the button
 */
function showButtonError(button: HTMLButtonElement, message: string): void {
  button.textContent = message;
  button.style.background = UI_CONSTANTS.COLORS.ERROR || '#ff3b30';
  button.style.cursor = 'not-allowed';
  button.dataset.disabled = 'true';
  
  // Reset button after 3 seconds
  setTimeout(() => {
    const input = button.closest('#modal-content')?.querySelector('textarea') as HTMLTextAreaElement;
    if (input) {
      const inputValue = input.value.trim();
      const actionId = determineAction(inputValue);
      const buttonText = getActionDisplayText(actionId, inputValue);
      resetButton(button, buttonText);
    } else {
      resetButton(button, '💭 Save Thought (double-enter to pin)');
    }
  }, 3000);
}

/**
 * Shows a success message on the button
 */
function showButtonSuccess(button: HTMLButtonElement, message: string): void {
  button.textContent = message;
  button.style.background = UI_CONSTANTS.COLORS.SUCCESS || '#34c759';
  button.style.cursor = 'pointer';
  button.dataset.disabled = 'false';
}

/**
 * Resets the button to its original state
 */
function resetButton(button: HTMLButtonElement, text: string): void {
  button.textContent = text;
  button.style.background = UI_CONSTANTS.COLORS.ACCENT_PRIMARY || '#007aff';
  button.style.cursor = 'pointer';
  button.dataset.disabled = 'false';
}

/**
 * Gets the current keyboard handler state
 */
export function getKeyboardHandlerState(): IKeyboardHandlerState {
  return { ...keyboardState };
}

/**
 * Resets the keyboard handler state
 */
export function resetKeyboardHandlerState(): void {
  if (keyboardState.saveConfirmationTimeout) {
    clearTimeout(keyboardState.saveConfirmationTimeout);
  }
  
  keyboardState = {
    lastEnterTime: 0,
    saveConfirmationTimeout: null,
    isProcessing: false
  };
}
