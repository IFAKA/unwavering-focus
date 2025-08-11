import { UI_CONSTANTS } from '../../constants';
import { setInput } from './modal-state';
import { createDynamicActionButton } from './modal-button';
import { handleKeyboardInput } from './keyboard-handler';

/**
 * Creates the modal content with input and button
 */
export function createModalContent(): void {
  const modal = document.querySelector('[data-extension="unwavering-focus"]');
  if (!modal) return;
  
  const content = modal.querySelector('#modal-content');
  if (!content) return;
  
  // Clear existing content
  content.innerHTML = '';
  
  // Create input
  const input = document.createElement('textarea');
  input.id = 'modal-input';
  input.placeholder = 'What would you like to do?';
  input.style.cssText = `
    width: 100%;
    min-height: 80px;
    padding: 12px;
    border: 1px solid rgba(255, 255, 255, 0.1);
    border-radius: 8px;
    background: rgba(255, 255, 255, 0.05);
    color: white;
    font-family: inherit;
    font-size: 14px;
    resize: vertical;
    outline: none;
    transition: border-color 0.2s ease;
    margin-bottom: 12px;
  `;
  
  // Add input event listener for dynamic button updates
  input.addEventListener('input', () => {
    createDynamicActionButton(content as HTMLElement, input);
  });
  
  // Add keyboard event listener
  input.addEventListener('keydown', (e) => {
    handleKeyboardInput(e, input);
  });
  
  // Store input reference
  setInput(input);
  
  // Add to content
  content.appendChild(input);
  
  // Create initial button
  createDynamicActionButton(content as HTMLElement, input);
  
  // Focus input after a short delay
  setTimeout(() => {
    input.focus();
  }, 100);
}

/**
 * Resets the modal content
 */
export function resetModalContent(): void {
  const modal = document.querySelector('[data-extension="unwavering-focus"]');
  if (!modal) return;
  
  const content = modal.querySelector('#modal-content');
  if (!content) return;
  
  // Clear content
  content.innerHTML = '';
  
  // Reset input reference
  setInput(null);
}
