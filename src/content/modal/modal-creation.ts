import { 
  MODAL_CONSTANTS, 
  ANIMATION_CONSTANTS 
} from '../../constants';

/**
 * Creates the modal element and attaches it to the DOM
 */
export function createModalElement(): HTMLElement {
  // Create container
  const modal = document.createElement('div');
  modal.setAttribute('data-extension', 'unwavering-focus');
  modal.style.cssText = `
    position: fixed;
    top: ${MODAL_CONSTANTS.POSITION.TOP};
    left: ${MODAL_CONSTANTS.POSITION.LEFT};
    width: ${MODAL_CONSTANTS.POSITION.WIDTH};
    height: ${MODAL_CONSTANTS.POSITION.HEIGHT};
    background: rgba(0, 0, 0, ${MODAL_CONSTANTS.STYLING.BACKGROUND_OPACITY});
    backdrop-filter: blur(${MODAL_CONSTANTS.STYLING.BACKDROP_BLUR});
    display: none;
    z-index: ${MODAL_CONSTANTS.Z_INDEX.MODAL};
    opacity: ${ANIMATION_CONSTANTS.OPACITY.HIDDEN};
    transition: opacity ${ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE}ms ${ANIMATION_CONSTANTS.EASING.EASE_OUT};
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
  `;
  
  // Create content
  const content = document.createElement('div');
  content.id = 'modal-content';
  content.style.cssText = `
    position: absolute;
    top: ${MODAL_CONSTANTS.GOLDEN_RATIO.VERTICAL_OFFSET};
    left: ${MODAL_CONSTANTS.GOLDEN_RATIO.HORIZONTAL_CENTER};
    transform: ${MODAL_CONSTANTS.TRANSFORM.INITIAL};
    background: ${MODAL_CONSTANTS.CONTENT.BACKGROUND_COLOR};
    border-radius: ${MODAL_CONSTANTS.STYLING.BORDER_RADIUS};
    padding: ${MODAL_CONSTANTS.STYLING.PADDING};
    width: ${MODAL_CONSTANTS.STYLING.WIDTH_PERCENTAGE};
    max-width: ${MODAL_CONSTANTS.STYLING.MAX_WIDTH};
    transition: transform ${ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE}ms ${ANIMATION_CONSTANTS.EASING.EASE_OUT};
    box-shadow: ${MODAL_CONSTANTS.CONTENT.BOX_SHADOW};
    border: 1px solid ${MODAL_CONSTANTS.CONTENT.BORDER_COLOR};
    backdrop-filter: blur(20px);
  `;
  
  // Click outside to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) {
      // Import the closeModal function dynamically to avoid circular dependency
      import('./modal-manager').then(({ closeModal }) => {
        closeModal();
      });
    }
  });
  
  // Assemble
  modal.appendChild(content);
  document.body.appendChild(modal);
  
  return modal;
}
