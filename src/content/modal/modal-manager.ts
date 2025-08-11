import { animateModalOpen, animateModalClose } from './modal-animations';
import { attemptFocus } from './modal-focus';
import { IModalState } from './modal-types';
import { createDynamicActionButton } from './modal-button';
import { createModalElement } from './modal-creation';
import { createModalInput, verifyInputElement } from './modal-input';

// Global modal state
let modalState: IModalState = {
  modal: null,
  input: null,
  focusAttempts: 0,
  focusTimeoutId: null,
  isFocusAttempting: false,
  isAnimating: false,
  countdownTimerElement: null,
  topRightContainer: null,
  lastEnterTime: 0,
  saveConfirmationTimeout: null
};

const DOUBLE_ENTER_TIMEOUT = 500;

/**
 * Creates the modal element and attaches it to the DOM
 */
export function createModal(): HTMLElement {
  // Remove any existing modals to prevent conflicts
  const existingModals = document.querySelectorAll('[data-extension="unwavering-focus"]');
  existingModals.forEach(existingModal => existingModal.remove());
  
  // Reset global state
  modalState.modal = null;
  modalState.input = null;
  
  // Create modal using the extracted creation function
  const modal = createModalElement();
  
  // Store reference
  modalState.modal = modal;
  
  return modal;
}

/**
 * Opens the modal with proper animations and focus management
 */
export async function openModal(): Promise<void> {
  if (modalState.isAnimating) {
    return;
  }
  
  // Wait for DOM to be ready
  if (document.readyState !== 'complete') {
    console.log('DOM not ready, waiting for complete state...');
    document.addEventListener('DOMContentLoaded', () => {
      setTimeout(() => openModal(), 100);
    });
    return;
  }
  
  // Ensure document.body exists and is accessible
  if (!document.body) {
    console.warn('Document body not available, retrying...');
    setTimeout(() => openModal(), 100);
    return;
  }
  
  modalState.isAnimating = true;
  modalState.isFocusAttempting = false;
  
  // Clear any existing focus attempts
  if (modalState.focusTimeoutId) {
    clearTimeout(modalState.focusTimeoutId);
    modalState.focusTimeoutId = null;
  }
  
  // Ensure we're not in a restricted page context
  if (window.location.protocol === 'chrome:' || window.location.protocol === 'chrome-extension:') {
    console.warn('Modal cannot be opened on restricted pages');
    modalState.isAnimating = false;
    return;
  }
  
  // Ensure the page is stable before creating modal
  if (document.visibilityState === 'hidden') {
    console.log('Page not visible, waiting for visibility...');
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => openModal(), 100);
      }
    });
    modalState.isAnimating = false;
    return;
  }
  
  // Create modal
  const modal = createModal();
  
  // Ensure modal was created successfully
  if (!modal) {
    console.error('Failed to create modal');
    modalState.isAnimating = false;
    return;
  }
  
  // Ensure modal is properly attached to DOM
  if (!document.contains(modal)) {
    console.error('Modal not properly attached to DOM');
    modalState.isAnimating = false;
    return;
  }
  
  // Create content and ensure it's properly attached
  await resetModalContent();
  
  // Double-check that input was created and is in DOM
  if (!modalState.input || !document.contains(modalState.input)) {
    console.error('Failed to create input element or input not in DOM');
    modalState.isAnimating = false;
    return;
  }
  
  // Ensure the modal content is properly rendered
  if (!modal) {
    console.error('Modal not found');
    modalState.isAnimating = false;
    return;
  }
  
  const modalContent = modal.querySelector('#modal-content') as HTMLElement;
  if (!modalContent) {
    console.error('Modal content not found');
    modalState.isAnimating = false;
    return;
  }
  
  // Animate modal opening
  animateModalOpen(modal, modalContent, () => {
    // Focus after animation completes
    modalState.focusTimeoutId = setTimeout(() => {
      if (modalState.input) {
        attemptFocus(modalState.input, () => {
          modalState.isAnimating = false;
        }, () => {
          modalState.isAnimating = false;
        });
      }
    }, 100);
  });
}

/**
 * Closes the modal with proper animations
 */
export function closeModal(): void {
  if (modalState.isAnimating) return;
  
  modalState.isAnimating = true;
  
  if (modalState.modal) {
    const modalContent = modalState.modal.querySelector('#modal-content') as HTMLElement;
    
    animateModalClose(modalState.modal, modalContent, () => {
      resetModalContent();
      modalState.isAnimating = false;
    });
  }
}

/**
 * Toggles the modal state
 */
export async function toggleModal(): Promise<void> {
  if (modalState.modal && modalState.modal.style.display === 'block') {
    closeModal();
  } else {
    await openModal();
  }
}

/**
 * Resets the modal content and creates new input and button
 */
export async function resetModalContent(): Promise<void> {
  if (!modalState.modal) return;
  
  const content = modalState.modal.querySelector('#modal-content') as HTMLElement;
  if (!content) return;
  
  // Clear content and recreate simplified UI
  content.innerHTML = '';
  
  // Create input using the extracted function
  const input = createModalInput(content);
  
  // Store input reference
  modalState.input = input;
  
  // Append input to content
  content.appendChild(input);
  
  // Create dynamic action button
  await createDynamicActionButton(content, input);
  
  // Force a reflow to ensure proper rendering
  input.offsetHeight;
  
  // Verify input is properly set up
  if (!verifyInputElement(input)) {
    modalState.input = null;
    return;
  }
}

/**
 * Gets the current modal state
 */
export function getModalState(): IModalState {
  return { ...modalState };
}

/**
 * Gets the modal element
 */
export function getModal(): HTMLElement | null {
  return modalState.modal;
}

/**
 * Gets the input element
 */
export function getInput(): HTMLTextAreaElement | null {
  return modalState.input;
}

/**
 * Gets the last enter time for double-enter detection
 */
export function getLastEnterTime(): number {
  return modalState.lastEnterTime;
}

/**
 * Sets the last enter time for double-enter detection
 */
export function setLastEnterTime(time: number): void {
  modalState.lastEnterTime = time;
}

/**
 * Gets the double enter timeout value
 */
export function getDoubleEnterTimeout(): number {
  return DOUBLE_ENTER_TIMEOUT;
}


