/**
 * Bulletproof Focus System - Comprehensive focus management with multiple fallback strategies
 * Implements 4 different focus strategies tried in sequence with comprehensive error handling
 */

import { tryImmediateFocus } from './focus-strategies';

export interface IFocusAttempt {
  attempt: number;
  strategy: string;
  success: boolean;
  error?: string;
}

export interface IFocusResult {
  success: boolean;
  attempts: IFocusAttempt[];
  finalAttempt: number;
}

/**
 * Attempts to focus an input element using multiple strategies
 */
export function attemptFocus(
  input: HTMLTextAreaElement,
  onSuccess?: () => void,
  onFailure?: () => void
): IFocusResult {
  const attempts: IFocusAttempt[] = [];
  let currentAttempt = 0;
  let isFocusAttempting = false;
  
  if (isFocusAttempting) {
    return { success: false, attempts, finalAttempt: currentAttempt };
  }
  
  isFocusAttempting = true;
  
  // Start with strategy 1
  tryImmediateFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure);
  
  return { success: false, attempts, finalAttempt: currentAttempt };
}

/**
 * Validates if an input element is ready for focus
 */
export function isInputReadyForFocus(input: HTMLTextAreaElement): boolean {
  if (!input || !document.contains(input)) {
    return false;
  }
  
  const rect = input.getBoundingClientRect();
  const isVisible = rect.width > 0 && rect.height > 0 && 
                   window.getComputedStyle(input).visibility !== 'hidden' &&
                   window.getComputedStyle(input).display !== 'none';
  
  return isVisible;
}

/**
 * Sets up text selection for an input element
 */
export function setupTextSelection(input: HTMLTextAreaElement): void {
  if (input.value) {
    input.select();
  } else {
    input.setSelectionRange(input.value.length, input.value.length);
  }
}

/**
 * Clears focus attempts and resets state
 */
export function clearFocusAttempts(): void {
  // This function can be used to reset focus state if needed
  // Implementation depends on the specific state management approach
}
