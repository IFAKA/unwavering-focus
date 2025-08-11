
import { determineAction, getActionDisplayText, canExecuteAction } from '../actions/action-executor';
import { handleKeyboardInput } from './keyboard-handler';



/**
 * Creates a dynamic action button based on input content
 */
export async function createDynamicActionButton(content: HTMLElement, input: HTMLTextAreaElement): Promise<void> {
  // Get existing button or create new one
  let button = content.querySelector('.dynamic-action-button') as HTMLButtonElement;
  const isNewButton = !button;
  
  if (isNewButton) {
    button = document.createElement('button');
    button.className = 'dynamic-action-button';
    content.appendChild(button);
  }
  
  const inputValue = input.value.trim();
  const actionId = determineAction(inputValue);
  const buttonText = getActionDisplayText(actionId, inputValue);
  const isDisabled = !(await canExecuteAction(actionId, inputValue));

  // Update button properties
  button.textContent = buttonText;
  button.disabled = isDisabled;
  button.dataset.actionId = actionId;
  button.dataset.disabled = isDisabled.toString();
  
  button.style.cssText = `
    width: 100%;
    background: ${isDisabled ? 'rgba(255, 255, 255, 0.1)' : '#007aff'};
    color: ${isDisabled ? 'rgba(255, 255, 255, 0.5)' : '#ffffff'};
    border: none;
    border-radius: 12px;
    padding: 12px 16px;
    font-size: 17px;
    font-weight: 600;
    cursor: ${isDisabled ? 'not-allowed' : 'pointer'};
    transition: all 0.2s ease;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    margin-top: 12px;
    opacity: ${isDisabled ? 0.5 : 1};
  `;

  // Only add event listeners for new buttons
  if (isNewButton) {
    // Add hover effects
    button.addEventListener('mouseenter', () => {
      if (!button.disabled) {
        button.style.background = '#0056cc';
        button.style.transform = 'translateY(-1px)';
      }
    });
    
    button.addEventListener('mouseleave', () => {
      if (!button.disabled) {
        button.style.background = '#007aff';
        button.style.transform = 'translateY(0)';
      }
    });

    // Add click handler
    button.addEventListener('click', async () => {
      if (button.disabled) return;
      
  
      
      // Use the new keyboard handler for consistent behavior
      // Create a synthetic keyboard event for the click
      const syntheticEvent = new KeyboardEvent('keydown', {
        key: 'Enter',
        shiftKey: false,
        bubbles: true,
        cancelable: true
      });
      
      // Prevent the default behavior
      syntheticEvent.preventDefault();
      
      // Handle the click using the keyboard handler
      await handleKeyboardInput(syntheticEvent, input, button);
    });
  }
}

/**
 * Shows a success message notification
 */
export function showSuccessMessage(message: string): void {
  const successMsg = document.createElement('div');
  successMsg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(52, 199, 89, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 1000000;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: fadeInOut 2s ease-in-out;
  `;
  successMsg.textContent = message;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-10px); }
      20% { opacity: 1; transform: translateY(0); }
      80% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-10px); }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(successMsg);
  
  setTimeout(() => {
    successMsg.remove();
    style.remove();
  }, 2000);
}

/**
 * Shows an error message notification
 */
export function showErrorMessage(message: string): void {
  const errorMsg = document.createElement('div');
  errorMsg.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(255, 59, 48, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 1000000;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: fadeInOut 2s ease-in-out;
  `;
  errorMsg.textContent = message;
  
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-10px); }
      20% { opacity: 1; transform: translateY(0); }
      80% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-10px); }
    }
  `;
  
  document.head.appendChild(style);
  document.body.appendChild(errorMsg);
  
  setTimeout(() => {
    errorMsg.remove();
    style.remove();
  }, 2000);
}
