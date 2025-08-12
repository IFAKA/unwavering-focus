import { initializeContentScript, cleanupManagers } from './initialization';
import { setupStorageListeners, setupMessageListeners } from './listeners';
import { resetKeyboardHandlerState } from './modal/keyboard-handler';
import { openModal } from './modal/modal-manager';

/**
 * Toggle the modal
 */
export async function toggleModal(): Promise<void> {
  try {
    await openModal();
  } catch (error) {
    console.error('Error toggling modal:', error);
  }
}

/**
 * Note: Alt+Shift+I is handled by the background script via manifest commands
 * The keyboard listener is removed to avoid conflicts
 */

/**
 * Clean up when page is about to unload
 */
window.addEventListener('beforeunload', () => {
  cleanupManagers();
  resetKeyboardHandlerState();
});

// Initialize the content script
initializeContentScript()
  .then(() => {
    // Set up listeners after initialization
    setupStorageListeners();
    setupMessageListeners();
  })
  .catch(console.error);
