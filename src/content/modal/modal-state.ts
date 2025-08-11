import { IModalState } from './modal-types';

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
 * Gets the current modal state
 */
export function getModalState(): IModalState {
  return modalState;
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
 * Gets the last enter time
 */
export function getLastEnterTime(): number {
  return modalState.lastEnterTime;
}

/**
 * Sets the last enter time
 */
export function setLastEnterTime(time: number): void {
  modalState.lastEnterTime = time;
}

/**
 * Gets the double enter timeout
 */
export function getDoubleEnterTimeout(): number {
  return DOUBLE_ENTER_TIMEOUT;
}

/**
 * Sets the modal element
 */
export function setModal(modal: HTMLElement | null): void {
  modalState.modal = modal;
}

/**
 * Sets the input element
 */
export function setInput(input: HTMLTextAreaElement | null): void {
  modalState.input = input;
}

/**
 * Sets the animation state
 */
export function setAnimating(isAnimating: boolean): void {
  modalState.isAnimating = isAnimating;
}

/**
 * Gets the animation state
 */
export function isAnimating(): boolean {
  return modalState.isAnimating;
}

/**
 * Resets the modal state
 */
export function resetModalState(): void {
  modalState = {
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
}
