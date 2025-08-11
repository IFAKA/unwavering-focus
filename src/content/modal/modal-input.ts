import { createDynamicActionButton } from './modal-button';
import { handleKeyboardInput } from './keyboard-handler';

/**
 * Creates and configures the modal input element
 */
export function createModalInput(content: HTMLElement): HTMLTextAreaElement {
  // Get selected text if any
  const selectedText = window.getSelection()?.toString().trim() || '';
  
  // Create input (textarea for formatted text support)
  const input = document.createElement('textarea');
  input.placeholder = 'Type your command or thought...';
  input.autocomplete = 'off';
  input.value = selectedText;
  input.style.cssText = `
    width: 100%;
    padding: 12px 16px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 12px;
    font-size: 17px;
    outline: none;
    background: rgba(255, 255, 255, 0.1);
    color: white;
    box-sizing: border-box;
    transition: all 0.2s ease;
    margin-bottom: 12px;
    min-height: 60px;
    max-height: 200px;
    resize: vertical;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    line-height: 1.4;
    font-weight: 400;
  `;
  
  // Add focus styles
  input.addEventListener('focus', () => {
    input.style.borderColor = 'rgba(255, 255, 255, 0.4)';
    input.style.boxShadow = '0 0 0 3px rgba(255, 255, 255, 0.1)';
  });
  
  input.addEventListener('blur', () => {
    input.style.borderColor = 'rgba(255, 255, 255, 0.2)';
    input.style.boxShadow = 'none';
  });
  
  // Add input change listener for dynamic height and button updates
  input.addEventListener('input', async () => {
    // Auto-resize textarea
    input.style.height = 'auto';
    input.style.height = Math.min(input.scrollHeight, 200) + 'px';
    
    // Update the dynamic action button
    await createDynamicActionButton(content, input);
  });

  // Add keyboard handling using the new keyboard handler
  input.addEventListener('keydown', async (e) => {
    const actionButton = content.querySelector('.dynamic-action-button') as HTMLButtonElement;
    if (actionButton) {
      await handleKeyboardInput(e, input, actionButton);
    }
  });
  
  return input;
}

/**
 * Verifies that the input element is properly set up
 */
export function verifyInputElement(input: HTMLTextAreaElement): boolean {
  // Verify input is properly attached to DOM
  if (!document.contains(input)) {
    console.warn('Input element not properly attached to DOM after creation');
    return false;
  }
  
  // Additional verification that input is accessible
  try {
    const testFocus = input.focus;
    if (typeof testFocus !== 'function') {
      console.warn('Input element focus method not available');
      return false;
    }
  } catch (error) {
    console.warn('Error testing input element:', error);
    return false;
  }
  
  return true;
}
