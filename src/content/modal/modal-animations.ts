import { 
  ANIMATION_CONSTANTS, 
  MODAL_CONSTANTS 
} from '../../constants';
import { IModalAnimationState } from './modal-types';

/**
 * Handles modal opening animations with accessibility considerations
 */
export function animateModalOpen(
  modal: HTMLElement,
  modalContent: HTMLElement,
  onComplete?: () => void
): void {
  const animationState = getModalAnimationState();
  
  if (animationState.prefersReducedMotion) {
    // Instant animation for users who prefer reduced motion
    modal.style.transition = 'none';
    modalContent.style.transition = 'none';
    
    // Show modal instantly
    modal.style.display = 'block';
    modal.style.opacity = ANIMATION_CONSTANTS.OPACITY.VISIBLE.toString();
    modalContent.style.transform = MODAL_CONSTANTS.TRANSFORM.FINAL;
    
    // Call completion callback after a short delay
    setTimeout(() => {
      onComplete?.();
    }, 100);
  } else {
    // Natural animation with spring-like easing for delightful motion
    modal.style.transition = `opacity ${ANIMATION_CONSTANTS.TIMING.QUICK_OPEN}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
    modalContent.style.transition = `transform ${ANIMATION_CONSTANTS.TIMING.QUICK_OPEN}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
    
    // Show modal
    modal.style.display = 'block';
    modal.style.opacity = ANIMATION_CONSTANTS.OPACITY.HIDDEN.toString();
    
    // Animate in with natural spring-like motion
    requestAnimationFrame(() => {
      modal.style.opacity = ANIMATION_CONSTANTS.OPACITY.VISIBLE.toString();
      modalContent.style.transform = MODAL_CONSTANTS.TRANSFORM.FINAL;
      
      // Call completion callback after animation completes
      setTimeout(() => {
        onComplete?.();
      }, ANIMATION_CONSTANTS.TIMING.QUICK_OPEN + 50);
    });
  }
}

/**
 * Handles modal closing animations with accessibility considerations
 */
export function animateModalClose(
  modal: HTMLElement,
  modalContent: HTMLElement,
  onComplete?: () => void
): void {
  const animationState = getModalAnimationState();
  
  if (animationState.prefersReducedMotion) {
    // Instant close for users who prefer reduced motion
    modal.style.display = 'none';
    onComplete?.();
  } else {
    // Natural animation with spring-like easing for delightful motion
    modal.style.transition = `opacity ${ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE}ms ${ANIMATION_CONSTANTS.EASING.EASE_IN}`;
    modalContent.style.transition = `transform ${ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE}ms ${ANIMATION_CONSTANTS.EASING.EASE_IN}`;
    
    // Animate out with natural motion
    modal.style.opacity = ANIMATION_CONSTANTS.OPACITY.HIDDEN.toString();
    modalContent.style.transform = MODAL_CONSTANTS.TRANSFORM.INITIAL;
    
    // Hide after animation and call completion callback
    setTimeout(() => {
      modal.style.display = 'none';
      onComplete?.();
    }, ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE_DELAY);
  }
}

/**
 * Handles confirmation animations
 */
export function animateConfirmation(
  content: HTMLElement,
  input: HTMLTextAreaElement,
  onComplete?: () => void
): void {
  const animationState = getModalAnimationState();
  
  if (animationState.prefersReducedMotion) {
    // Instant confirmation for users who prefer reduced motion
    onComplete?.();
  } else {
    // Natural animation with spring-like easing for delightful motion
    input.style.opacity = ANIMATION_CONSTANTS.OPACITY.HIDDEN.toString();
    input.style.transition = `opacity ${ANIMATION_CONSTANTS.TIMING.CONFIRMATION_FADE_OUT}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
    
    setTimeout(() => {
      // Fade in confirmation with natural spring-like motion
      content.style.opacity = ANIMATION_CONSTANTS.OPACITY.HIDDEN.toString();
      content.style.transition = `opacity ${ANIMATION_CONSTANTS.TIMING.CONFIRMATION_FADE_IN}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
      
      requestAnimationFrame(() => {
        content.style.opacity = ANIMATION_CONSTANTS.OPACITY.VISIBLE.toString();
      });
      
      onComplete?.();
    }, ANIMATION_CONSTANTS.TIMING.CONFIRMATION_FADE_OUT);
  }
}

/**
 * Gets the current modal animation state
 */
export function getModalAnimationState(): IModalAnimationState {
  return {
    prefersReducedMotion: window.matchMedia('(prefers-reduced-motion: reduce)').matches,
    isVisible: document.visibilityState === 'visible',
    isAnimating: false
  };
}

/**
 * Checks if animations should be disabled
 */
export function shouldDisableAnimations(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/**
 * Applies animation styles based on user preferences
 */
export function applyAnimationStyles(
  element: HTMLElement,
  transition: string,
  duration: number,
  easing: string
): void {
  if (shouldDisableAnimations()) {
    element.style.transition = 'none';
  } else {
    element.style.transition = `${transition} ${duration}ms ${easing}`;
  }
}
