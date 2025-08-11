import { IFocusAttempt } from './modal-focus';

/**
 * Strategy 1: Immediate focus with requestAnimationFrame (first 10 attempts)
 */
export function tryImmediateFocus(
  input: HTMLTextAreaElement,
  attempts: IFocusAttempt[],
  currentAttempt: number,
  isFocusAttempting: boolean,
  onSuccess?: () => void,
  onFailure?: () => void
): void {
  if (currentAttempt >= 10) {
    // Move to strategy 2
    tryShortTimeoutFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure);
    return;
  }
  
  currentAttempt++;
  
  try {
    // Comprehensive readiness checks
    if (!input || !document.contains(input)) {
      attempts.push({
        attempt: currentAttempt,
        strategy: 'immediate',
        success: false,
        error: 'Input not ready for focus'
      });
      requestAnimationFrame(() => tryImmediateFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure));
      return;
    }
    
    // Check visibility and dimensions
    const rect = input.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0 && 
                     window.getComputedStyle(input).visibility !== 'hidden' &&
                     window.getComputedStyle(input).display !== 'none';
    
    if (!isVisible) {
      attempts.push({
        attempt: currentAttempt,
        strategy: 'immediate',
        success: false,
        error: 'Input not visible'
      });
      requestAnimationFrame(() => tryImmediateFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure));
      return;
    }
    
    // Attempt focus
    input.focus();
    
    // Verify focus was successful
    if (document.activeElement === input) {
      // Success! Set up text selection
      if (input.value) {
        input.select();
      } else {
        input.setSelectionRange(input.value.length, input.value.length);
      }
      
      attempts.push({
        attempt: currentAttempt,
        strategy: 'immediate',
        success: true
      });
      
      isFocusAttempting = false;
      onSuccess?.();
      return;
    }
    
    // Focus failed, try again
    attempts.push({
      attempt: currentAttempt,
      strategy: 'immediate',
      success: false,
      error: 'Focus not successful'
    });
    requestAnimationFrame(() => tryImmediateFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure));
    
  } catch (error) {
    attempts.push({
      attempt: currentAttempt,
      strategy: 'immediate',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    requestAnimationFrame(() => tryImmediateFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure));
  }
}

/**
 * Strategy 2: Short timeouts (next 10 attempts)
 */
export function tryShortTimeoutFocus(
  input: HTMLTextAreaElement,
  attempts: IFocusAttempt[],
  currentAttempt: number,
  isFocusAttempting: boolean,
  onSuccess?: () => void,
  onFailure?: () => void
): void {
  if (currentAttempt >= 20) {
    // Move to strategy 3
    tryLongTimeoutFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure);
    return;
  }
  
  currentAttempt++;
  
  try {
    if (!input || !document.contains(input)) {
      attempts.push({
        attempt: currentAttempt,
        strategy: 'short-timeout',
        success: false,
        error: 'Input not ready for short timeout focus'
      });
      setTimeout(() => tryShortTimeoutFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure), 150);
      return;
    }
    
    // Check if input is still valid
    const rect = input.getBoundingClientRect();
    const isVisible = rect.width > 0 && rect.height > 0;
    
    if (!isVisible) {
      attempts.push({
        attempt: currentAttempt,
        strategy: 'short-timeout',
        success: false,
        error: 'Input not visible'
      });
      setTimeout(() => tryShortTimeoutFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure), 150);
      return;
    }
    
    // Attempt focus with short timeout
    input.focus();
    
    if (document.activeElement === input) {
      if (input.value) {
        input.select();
      } else {
        input.setSelectionRange(input.value.length, input.value.length);
      }
      
      attempts.push({
        attempt: currentAttempt,
        strategy: 'short-timeout',
        success: true
      });
      
      isFocusAttempting = false;
      onSuccess?.();
      return;
    }
    
    attempts.push({
      attempt: currentAttempt,
      strategy: 'short-timeout',
      success: false,
      error: 'Focus not successful'
    });
    setTimeout(() => tryShortTimeoutFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure), 150);
    
  } catch (error) {
    attempts.push({
      attempt: currentAttempt,
      strategy: 'short-timeout',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    setTimeout(() => tryShortTimeoutFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure), 150);
  }
}

/**
 * Strategy 3: Longer timeouts (final 5 attempts)
 */
export function tryLongTimeoutFocus(
  input: HTMLTextAreaElement,
  attempts: IFocusAttempt[],
  currentAttempt: number,
  isFocusAttempting: boolean,
  onSuccess?: () => void,
  onFailure?: () => void
): void {
  if (currentAttempt >= 25) {
    // All strategies failed
    attempts.push({
      attempt: currentAttempt,
      strategy: 'long-timeout',
      success: false,
      error: 'All focus strategies failed after 25 attempts'
    });
    isFocusAttempting = false;
    onFailure?.();
    return;
  }
  
  currentAttempt++;
  
  try {
    if (!input || !document.contains(input)) {
      attempts.push({
        attempt: currentAttempt,
        strategy: 'long-timeout',
        success: false,
        error: 'Input not ready for long timeout focus'
      });
      setTimeout(() => tryLongTimeoutFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure), 300);
      return;
    }
    
    // Final attempt with longer timeout
    input.focus();
    
    if (document.activeElement === input) {
      if (input.value) {
        input.select();
      } else {
        input.setSelectionRange(input.value.length, input.value.length);
      }
      
      attempts.push({
        attempt: currentAttempt,
        strategy: 'long-timeout',
        success: true
      });
      
      isFocusAttempting = false;
      onSuccess?.();
      return;
    }
    
    attempts.push({
      attempt: currentAttempt,
      strategy: 'long-timeout',
      success: false,
      error: 'Focus not successful'
    });
    setTimeout(() => tryLongTimeoutFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure), 300);
    
  } catch (error) {
    attempts.push({
      attempt: currentAttempt,
      strategy: 'long-timeout',
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    });
    setTimeout(() => tryLongTimeoutFocus(input, attempts, currentAttempt, isFocusAttempting, onSuccess, onFailure), 300);
  }
}
