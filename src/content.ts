import { 
  MODAL_CONSTANTS, 
  ANIMATION_CONSTANTS, 
  FEATURE_CONSTANTS,
  UI_CONSTANTS 
} from './constants';
import { YouTubeDistractionBlocker, isYouTubePage } from './utils/youtubeUtils';
import { VideoFocusManager, supportsVideoFocus } from './utils/videoFocusUtils';

// Smart Search Modal - Command Palette Implementation
let modal: HTMLElement | null = null;
let input: HTMLTextAreaElement | null = null;
let focusAttempts = 0;
let focusTimeoutId: ReturnType<typeof setTimeout> | null = null;
let isFocusAttempting = false;
let isAnimating = false;
let pinnedTaskElement: HTMLElement | null = null;
let countdownTimerElement: HTMLElement | null = null;
let topRightContainer: HTMLElement | null = null;
let lastEnterTime = 0; // Track last Enter press for double-enter detection
let saveConfirmationTimeout: ReturnType<typeof setTimeout> | null = null; // Track confirmation timeout
const DOUBLE_ENTER_TIMEOUT = 500; // Reduced to 500ms for faster response
// Focus attempts are now simplified - no retry limit needed

// Clean up any existing overlays on page load/refresh
document.addEventListener('DOMContentLoaded', () => {
  const existingOverlays = document.querySelectorAll('[data-extension="unwavering-focus"]');
  existingOverlays.forEach(overlay => overlay.remove());
});

// Note: Alt+Shift+I is handled by the background script via manifest commands
// The keyboard listener is removed to avoid conflicts

function toggleModal() {
  if (modal && modal.style.display === 'block') {
    closeModal();
  } else {
    openModal();
  }
}

function openModal() {
  if (isAnimating) {
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
  
  isAnimating = true;
  isFocusAttempting = false;
  
  // Clear any existing focus attempts
  if (focusTimeoutId) {
    clearTimeout(focusTimeoutId);
    focusTimeoutId = null;
  }
  
  // Ensure we're not in a restricted page context
  if (window.location.protocol === 'chrome:' || window.location.protocol === 'chrome-extension:') {
    console.warn('Modal cannot be opened on restricted pages');
    isAnimating = false;
    return;
  }
  
  // Remove any existing modals to prevent conflicts
  const existingModals = document.querySelectorAll('[data-extension="unwavering-focus"]');
  existingModals.forEach(existingModal => existingModal.remove());
  
  // Reset global state
  modal = null;
  input = null;
  
  // Ensure the page is stable before creating modal
  if (document.visibilityState === 'hidden') {
    console.log('Page not visible, waiting for visibility...');
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'visible') {
        setTimeout(() => openModal(), 100);
      }
    });
    isAnimating = false;
    return;
  }
  
  // Create modal
  createModal();
  
  // Ensure modal was created successfully
  if (!modal) {
    console.error('Failed to create modal');
    isAnimating = false;
    return;
  }
  
  // Ensure modal is properly attached to DOM
  if (!document.contains(modal)) {
    console.error('Modal not properly attached to DOM');
    isAnimating = false;
    return;
  }
  
  // Create content and ensure it's properly attached
  resetModalContent();
  
  // Double-check that input was created and is in DOM
  if (!input || !document.contains(input)) {
    console.error('Failed to create input element or input not in DOM');
    isAnimating = false;
    return;
  }
  
  // Ensure the modal content is properly rendered
  if (!modal) {
    console.error('Modal not found');
    isAnimating = false;
    return;
  }
  
  const modalContent = modal.querySelector('#modal-content') as HTMLElement;
  if (!modalContent) {
    console.error('Modal content not found');
    isAnimating = false;
    return;
  }
  
  // Check for reduced motion preference - Accessibility first
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  // Set animation based on user preference
  if (prefersReducedMotion) {
    // Instant animation for users who prefer reduced motion
    if (modal) {
      modal.style.transition = 'none';
      if (modalContent) {
        modalContent.style.transition = 'none';
      }
      
      // Show modal instantly
      modal.style.display = 'block';
      modal.style.opacity = ANIMATION_CONSTANTS.OPACITY.VISIBLE.toString();
      if (modalContent) {
        modalContent.style.transform = MODAL_CONSTANTS.TRANSFORM.FINAL;
      }
      
      // Focus after a short delay to ensure modal is fully rendered
      focusTimeoutId = setTimeout(() => {
        attemptFocus();
      }, 100);
    }
  } else {
    // Natural animation with spring-like easing for delightful motion
    if (modal) {
      modal.style.transition = `opacity ${ANIMATION_CONSTANTS.TIMING.QUICK_OPEN}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
      if (modalContent) {
        modalContent.style.transition = `transform ${ANIMATION_CONSTANTS.TIMING.QUICK_OPEN}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
      }
      
      // Show modal
      modal.style.display = 'block';
      modal.style.opacity = ANIMATION_CONSTANTS.OPACITY.HIDDEN.toString();
      
      // Animate in with natural spring-like motion
      requestAnimationFrame(() => {
        if (modal) {
          modal.style.opacity = ANIMATION_CONSTANTS.OPACITY.VISIBLE.toString();
          if (modalContent) {
            modalContent.style.transform = MODAL_CONSTANTS.TRANSFORM.FINAL;
          }
          
          // Start focus attempts after animation completes
          focusTimeoutId = setTimeout(() => {
            attemptFocus();
          }, ANIMATION_CONSTANTS.TIMING.QUICK_OPEN + 50);
        }
      });
    }
  }
}

function attemptFocus() {
  if (isFocusAttempting) return; // Prevent multiple simultaneous focus attempts
  
  isFocusAttempting = true;
  
  // Simple check: if input exists and is in DOM, try to focus it
  if (input && document.contains(input)) {
    try {
      // Simple focus attempt
      input.focus();
      
      // Check if focus was successful
      if (document.activeElement === input) {
        // Success! Set up text selection
        if (input.value) {
          input.select();
        } else {
          input.setSelectionRange(input.value.length, input.value.length);
        }
        
        isAnimating = false;
        isFocusAttempting = false;
        return;
      }
    } catch (error) {
      console.warn('Focus attempt failed:', error);
    }
  } else {
    console.warn('Input element not available for focus');
  }
  
  // If we get here, focus failed
  isFocusAttempting = false;
  isAnimating = false;
  console.log('Focus attempt completed (may not have succeeded)');
}

function closeModal() {
  if (isAnimating) return;
  isAnimating = true;
  
  // Check for reduced motion preference - Accessibility first
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Instant close for users who prefer reduced motion
    if (modal) {
      modal.style.display = 'none';
    }
    resetModalContent();
    isAnimating = false;
  } else {
    // Natural animation with spring-like easing for delightful motion
    if (modal) {
      modal.style.transition = `opacity ${ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE}ms ${ANIMATION_CONSTANTS.EASING.EASE_IN}`;
      const content = modal.querySelector('#modal-content') as HTMLElement;
      if (content) {
        content.style.transition = `transform ${ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE}ms ${ANIMATION_CONSTANTS.EASING.EASE_IN}`;
      }
      
      // Animate out with natural motion
      modal.style.opacity = ANIMATION_CONSTANTS.OPACITY.HIDDEN.toString();
      if (content) {
        content.style.transform = MODAL_CONSTANTS.TRANSFORM.INITIAL;
      }
      
      // Hide after animation and reset content
      setTimeout(() => {
        if (modal) {
          modal.style.display = 'none';
        }
        resetModalContent();
        isAnimating = false;
      }, ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE_DELAY);
    }
  }
}

function resetModalContent() {
  if (!modal) return;
  
  const content = modal.querySelector('#modal-content') as HTMLElement;
  if (!content) return;
  
  // Clear content and recreate simplified UI
  content.innerHTML = '';
  
  // Get selected text if any
  const selectedText = window.getSelection()?.toString().trim() || '';
  
  // Create input (textarea for formatted text support)
  input = document.createElement('textarea');
  input.placeholder = 'Type your command or thought...';
  input.autocomplete = 'off';
  input.value = selectedText;
  input.style.cssText = `
    width: 100%;
    padding: ${MODAL_CONSTANTS.INPUT.PADDING};
    border: ${MODAL_CONSTANTS.INPUT.BORDER_WIDTH} solid ${MODAL_CONSTANTS.CONTENT.BORDER_COLOR};
    border-radius: ${MODAL_CONSTANTS.INPUT.BORDER_RADIUS};
    font-size: ${MODAL_CONSTANTS.INPUT.FONT_SIZE};
    outline: none;
    background: ${UI_CONSTANTS.COLORS.BACKGROUND_PRIMARY};
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    box-sizing: border-box;
    transition: ${UI_CONSTANTS.TRANSITIONS.NORMAL};
    margin-bottom: ${UI_CONSTANTS.SPACING.MD};
    min-height: ${MODAL_CONSTANTS.INPUT.MIN_HEIGHT};
    max-height: ${MODAL_CONSTANTS.INPUT.MAX_HEIGHT};
    resize: vertical;
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    line-height: 1.4;
    font-weight: ${UI_CONSTANTS.FONT_WEIGHT.NORMAL};
  `;
  
  // Add focus styles
  input.addEventListener('focus', () => {
    input!.style.borderColor = MODAL_CONSTANTS.CONTENT.FOCUS_BORDER_COLOR;
    input!.style.boxShadow = MODAL_CONSTANTS.CONTENT.FOCUS_BOX_SHADOW;
  });
  
  input.addEventListener('blur', () => {
    input!.style.borderColor = MODAL_CONSTANTS.CONTENT.BORDER_COLOR;
    input!.style.boxShadow = 'none';
  });
  
  // Create adaptive action button
  const actionButton = document.createElement('button');
  actionButton.id = 'adaptive-action-button';
  actionButton.type = 'button';
  actionButton.style.cssText = `
    width: 100%;
    padding: ${UI_CONSTANTS.SPACING.MD} ${UI_CONSTANTS.SPACING.LG};
    background: ${UI_CONSTANTS.COLORS.ACCENT_PRIMARY};
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    border: none;
    border-radius: ${UI_CONSTANTS.BORDER_RADIUS.MD};
    font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
    font-size: ${UI_CONSTANTS.FONT_SIZE.MD};
    font-weight: ${UI_CONSTANTS.FONT_WEIGHT.SEMIBOLD};
    cursor: pointer;
    transition: ${UI_CONSTANTS.TRANSITIONS.FAST};
    box-shadow: ${UI_CONSTANTS.SHADOWS.SMALL};
    outline: none;
  `;
  
  // Add hover effects
  actionButton.addEventListener('mouseenter', () => {
    actionButton.style.transform = 'translateY(-1px)';
    actionButton.style.boxShadow = UI_CONSTANTS.SHADOWS.MEDIUM;
  });
  
  actionButton.addEventListener('mouseleave', () => {
    actionButton.style.transform = 'translateY(0)';
    actionButton.style.boxShadow = UI_CONSTANTS.SHADOWS.SMALL;
  });
  
  // Add focus styles for accessibility
  actionButton.addEventListener('focus', () => {
    actionButton.style.boxShadow = `0 0 0 3px ${UI_CONSTANTS.COLORS.ACCENT_PRIMARY}40`;
  });
  
  actionButton.addEventListener('blur', () => {
    actionButton.style.boxShadow = UI_CONSTANTS.SHADOWS.SMALL;
  });
  
  // Function to update button based on input
  function updateActionButton() {
    if (!input || !actionButton) return;
    
    const inputValue = input.value.trim();
    let buttonText = '';
    let actionId = '';
    let isDisabled = false;
    
    if (inputValue === '') {
      // Empty input: Box Breathing
      buttonText = '🫁 Start Box Breathing';
      actionId = 'box-breathing';
    } else if (/^\d+$/.test(inputValue)) {
      // Numbers only: Timer
      buttonText = `⏱️ Start ${inputValue}-minute Timer`;
      actionId = 'timer';
    } else {
      // Any other content: Save Thought
      buttonText = '💭 Save Thought (double-enter to pin)';
      actionId = 'save-thought';
    }
    
    // Check if action should be disabled
    if (actionId === 'timer') {
      hasExistingTimer().then(hasTimer => {
        if (hasTimer) {
          actionButton.textContent = '⏱️ Timer Already Running';
          actionButton.style.background = UI_CONSTANTS.COLORS.TEXT_SECONDARY;
          actionButton.style.cursor = 'not-allowed';
          isDisabled = true;
        } else {
          actionButton.textContent = buttonText;
          actionButton.style.background = UI_CONSTANTS.COLORS.ACCENT_PRIMARY;
          actionButton.style.cursor = 'pointer';
          isDisabled = false;
        }
      });
    } else {
      actionButton.textContent = buttonText;
      actionButton.style.background = UI_CONSTANTS.COLORS.ACCENT_PRIMARY;
      actionButton.style.cursor = 'pointer';
      isDisabled = false;
    }
    
    // Store current action for execution
    actionButton.dataset.actionId = actionId;
    actionButton.dataset.disabled = isDisabled.toString();
  }
  
  // Add input change listener
  input.addEventListener('input', updateActionButton);
  
  // Add keyboard listeners with double-enter logic
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      
      const currentTime = Date.now();
      const inputValue = input!.value.trim();
      const actionId = actionButton.dataset.actionId;
      
      // Check for double-enter (pin task)
      if (inputValue && actionId === 'save-thought' && 
          currentTime - lastEnterTime < DOUBLE_ENTER_TIMEOUT) {
        // Double-enter detected: Pin Task
        // Clear any pending save confirmation
        if (saveConfirmationTimeout) {
          clearTimeout(saveConfirmationTimeout);
          saveConfirmationTimeout = null;
        }
        pinTask(inputValue);
        lastEnterTime = 0; // Reset
      } else {
        // Single enter: Execute normal action
        if (actionId && actionButton.dataset.disabled !== 'true') {
          if (actionId === 'timer' && inputValue === '') {
            executeAction('timer', '25'); // Default 25 minutes
          } else if (actionId === 'save-thought') {
            // For save-thought, delay confirmation to allow for double-enter
            saveThought(inputValue);
            lastEnterTime = currentTime;
          } else {
            executeAction(actionId, inputValue);
            lastEnterTime = currentTime;
          }
        } else {
          lastEnterTime = currentTime;
        }
      }
    } else if (e.key === 'Escape') {
      closeModal();
    }
  });
  
  // Add button click listener
  actionButton.addEventListener('click', () => {
    if (actionButton.dataset.disabled === 'true') return;
    
    const actionId = actionButton.dataset.actionId;
    const inputValue = input!.value.trim();
    
    if (actionId) {
      if (actionId === 'timer' && inputValue === '') {
        executeAction('timer', '25'); // Default 25 minutes
      } else {
        executeAction(actionId, inputValue);
      }
    }
  });
  
  // Append elements
  content.appendChild(input);
  content.appendChild(actionButton);
  
  // Initialize button state
  updateActionButton();
  
  // Force a reflow to ensure proper rendering
  input.offsetHeight;
  
  // Verify input is properly attached to DOM
  if (!document.contains(input)) {
    console.warn('Input element not properly attached to DOM after creation');
    input = null;
    return;
  }
  
  // Additional verification that input is accessible
  try {
    const testFocus = input.focus;
    if (typeof testFocus !== 'function') {
      console.warn('Input element focus method not available');
      input = null;
      return;
    }
  } catch (error) {
    console.warn('Error testing input element:', error);
    input = null;
    return;
  }
}

function createModal() {
  // Create container
  modal = document.createElement('div');
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
      closeModal();
    }
  });
  
  // Assemble
  modal.appendChild(content);
  document.body.appendChild(modal);
}

function executeAction(actionId: string, text: string) {
  switch (actionId) {
    case 'save-thought':
      saveThought(text);
      break;
    case 'pin-task':
      // Check if a pinned task already exists
      hasExistingPinnedTask().then(hasPinnedTask => {
        if (hasPinnedTask) {
          showConfirmation('Task already pinned. Remove existing task first.');
        } else {
          pinTask(text);
        }
      });
      break;
    case 'box-breathing':
      startBoxBreathing(text);
      break;
    case 'timer':
      // Check if a timer already exists
      hasExistingTimer().then(hasTimer => {
        if (hasTimer) {
          showConfirmation('Timer already running. Cancel existing timer first.');
        } else {
          startTimer(text);
        }
      });
      break;
    default:
      console.warn('Unknown action:', actionId);
  }
}

function saveThought(text: string) {
  if (!text.trim()) return;
  
  // Clear any existing confirmation timeout
  if (saveConfirmationTimeout) {
    clearTimeout(saveConfirmationTimeout);
    saveConfirmationTimeout = null;
  }
  
  // Save to storage
  chrome.runtime.sendMessage({
    type: FEATURE_CONSTANTS.MESSAGE_TYPES.SAVE_SEARCH,
    query: text
  }).then(() => {
    // Show immediate feedback in button
    const actionButton = document.getElementById('adaptive-action-button') as HTMLButtonElement;
    if (actionButton) {
      const originalText = actionButton.textContent;
      actionButton.textContent = '💭 Thought Saved! (press Enter again to pin)';
      actionButton.style.background = UI_CONSTANTS.COLORS.SUCCESS;
      
      // Set timeout to show confirmation and reset button
      saveConfirmationTimeout = setTimeout(() => {
        showConfirmation('Thought saved for later');
        // Reset button to original state
        if (actionButton) {
          actionButton.textContent = originalText;
          actionButton.style.background = UI_CONSTANTS.COLORS.ACCENT_PRIMARY;
        }
      }, DOUBLE_ENTER_TIMEOUT);
    }
  }).catch(console.error);
}

function pinTask(text: string) {
  if (!text.trim()) return;
  
  // Store pinned task in chrome.storage for cross-tab persistence
  chrome.storage.local.set({ pinnedTask: text }, () => {
    showConfirmation('Task pinned to top-right corner');
  });
}

function startBoxBreathing(text: string) {
  // Close the command palette first
  closeModal();
  
  // Create box breathing visualizer with Apple Watch styling
  const breathingElement = document.createElement('div');
  breathingElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: ${UI_CONSTANTS.COLORS.BACKGROUND_PRIMARY};
    backdrop-filter: blur(20px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${MODAL_CONSTANTS.Z_INDEX.MODAL};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    opacity: 0;
    transition: opacity ${ANIMATION_CONSTANTS.TIMING.QUICK_OPEN}ms ${ANIMATION_CONSTANTS.EASING.SPRING};
  `;
  
  // Create the breathing circle with Apple Watch design
  const circle = document.createElement('div');
  circle.style.cssText = `
    width: 160px;
    height: 160px;
    border: 2px solid ${UI_CONSTANTS.COLORS.ACCENT_PRIMARY};
    border-radius: ${UI_CONSTANTS.BORDER_RADIUS.FULL};
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    font-size: ${UI_CONSTANTS.FONT_SIZE.XL};
    font-weight: ${UI_CONSTANTS.FONT_WEIGHT.SEMIBOLD};
    transition: all 4s ${ANIMATION_CONSTANTS.EASING.EASE_IN_OUT};
    position: relative;
    background: rgba(0, 122, 255, 0.05);
    box-shadow: ${UI_CONSTANTS.SHADOWS.LARGE};
    transform: scale(${ANIMATION_CONSTANTS.SCALE.SPRING_IN});
  `;
  
  // Create instruction text with Apple Watch typography
  const instruction = document.createElement('div');
  instruction.style.cssText = `
    position: absolute;
    bottom: ${UI_CONSTANTS.SPACING.XXXL};
    left: 50%;
    transform: translateX(-50%);
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    font-size: ${UI_CONSTANTS.FONT_SIZE.MD};
    font-weight: ${UI_CONSTANTS.FONT_WEIGHT.MEDIUM};
    text-align: center;
    max-width: 400px;
    line-height: 1.4;
    opacity: 0;
    transition: opacity ${ANIMATION_CONSTANTS.TIMING.QUICK_OPEN}ms ${ANIMATION_CONSTANTS.EASING.SPRING};
  `;
  
  if (text.trim()) {
    instruction.innerHTML = `
      <div style="margin-bottom: ${UI_CONSTANTS.SPACING.MD}; font-size: ${UI_CONSTANTS.FONT_SIZE.SM}; opacity: 0.7; color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};">Focus on:</div>
      <div style="white-space: pre-wrap; font-weight: ${UI_CONSTANTS.FONT_WEIGHT.NORMAL};">${text}</div>
    `;
  } else {
    instruction.innerHTML = `
      <div style="font-size: ${UI_CONSTANTS.FONT_SIZE.SM}; opacity: 0.7; color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};">Press ESC or tap outside to stop</div>
    `;
  }
  
  breathingElement.appendChild(circle);
  breathingElement.appendChild(instruction);
  document.body.appendChild(breathingElement);
  
  // Animate in with spring effect
  requestAnimationFrame(() => {
    breathingElement.style.opacity = '1';
    circle.style.transform = 'scale(1)';
    instruction.style.opacity = '1';
  });
  
  // Box breathing phases with Apple Watch timing
  const phases = [
    { 
      name: 'Inhale', 
      duration: 4000, 
      scale: 1.15, 
      opacity: 1,
      borderColor: UI_CONSTANTS.COLORS.ACCENT_PRIMARY,
      backgroundColor: 'rgba(0, 122, 255, 0.1)'
    },
    { 
      name: 'Hold', 
      duration: 4000, 
      scale: 1.15, 
      opacity: 0.9,
      borderColor: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
      backgroundColor: 'rgba(142, 142, 147, 0.05)'
    },
    { 
      name: 'Exhale', 
      duration: 4000, 
      scale: 0.85, 
      opacity: 0.8,
      borderColor: UI_CONSTANTS.COLORS.ACCENT_PRIMARY,
      backgroundColor: 'rgba(0, 122, 255, 0.05)'
    },
    { 
      name: 'Hold', 
      duration: 4000, 
      scale: 0.85, 
      opacity: 0.7,
      borderColor: UI_CONSTANTS.COLORS.TEXT_SECONDARY,
      backgroundColor: 'rgba(142, 142, 147, 0.03)'
    }
  ];
  
  let currentPhase = 0;
  let isActive = true;
  
  function updateBreathing() {
    if (!isActive) return;
    
    const phase = phases[currentPhase];
    circle.textContent = phase.name;
    circle.style.transform = `scale(${phase.scale})`;
    circle.style.opacity = phase.opacity.toString();
    circle.style.borderColor = phase.borderColor;
    circle.style.background = phase.backgroundColor;
    
    setTimeout(() => {
      if (isActive) {
        currentPhase = (currentPhase + 1) % phases.length;
        updateBreathing();
      }
    }, phase.duration);
  }
  
  // Start the breathing cycle
  updateBreathing();
  
  // Handle close events with smooth animations
  const closeBreathing = () => {
    isActive = false;
    
    // Animate out with spring effect
    breathingElement.style.opacity = '0';
    circle.style.transform = `scale(${ANIMATION_CONSTANTS.SCALE.SPRING_IN})`;
    instruction.style.opacity = '0';
    
    setTimeout(() => {
      breathingElement.remove();
    }, ANIMATION_CONSTANTS.TIMING.QUICK_CLOSE);
  };
  
  // ESC key to close
  const handleKeydown = (e: KeyboardEvent) => {
    if (e.key === 'Escape') {
      closeBreathing();
      document.removeEventListener('keydown', handleKeydown);
    }
  };
  
  // Click outside to close
  const handleClick = (e: MouseEvent) => {
    if (e.target === breathingElement) {
      closeBreathing();
      breathingElement.removeEventListener('click', handleClick);
    }
  };
  
  document.addEventListener('keydown', handleKeydown);
  breathingElement.addEventListener('click', handleClick);
}

function startTimer(text: string) {
  // Parse input as minutes
  const inputValue = text.trim();
  let minutes = 25; // Default 25 minutes
  
  if (inputValue) {
    const numValue = parseFloat(inputValue);
    if (!isNaN(numValue)) {
      minutes = Math.round(numValue);
    }
  }
  
  // Ensure minimum 1 minute
  minutes = Math.max(1, minutes);
  
  // Close the modal
  closeModal();
  
  // Store timer data for cross-tab synchronization
  const timerData = {
    startTime: Date.now(),
    remainingSeconds: minutes * 60
  };
  
  chrome.storage.local.set({ countdownTimer: timerData }, () => {
    showConfirmation(`Timer started: ${minutes} minutes`);
  });
}

// Function to create countdown timer element
function createCountdownTimerElement() {
  // Remove existing timer
  if (countdownTimerElement) {
    countdownTimerElement.remove();
    countdownTimerElement = null;
  }
  
  // Create countdown timer
  countdownTimerElement = document.createElement('div');
  countdownTimerElement.id = 'unwavering-focus-timer';
  countdownTimerElement.style.cssText = `
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 8px 12px;
    border-radius: 8px 0 0 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    font-weight: 600;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    text-align: center;
    cursor: pointer;
    width: fit-content;
    transition: ${UI_CONSTANTS.TRANSITIONS.FAST};
    user-select: none;
    pointer-events: auto;
    align-self: flex-end;
    position: relative;
  `;
  
  // Add hover effect
  countdownTimerElement.addEventListener('mouseenter', () => {
    countdownTimerElement!.style.background = 'rgba(220, 38, 38, 0.9)';
    countdownTimerElement!.style.transform = 'scale(1.05)';
    
    // Create cancel text overlay
    const cancelText = document.createElement('div');
    cancelText.textContent = 'Cancel';
    cancelText.style.cssText = `
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-size: 14px;
      font-weight: 600;
      background: rgba(220, 38, 38, 0.9);
      border-radius: 8px 0 0 8px;
    `;
    cancelText.id = 'cancel-overlay';
    countdownTimerElement!.appendChild(cancelText);
  });
  
  countdownTimerElement.addEventListener('mouseleave', () => {
    countdownTimerElement!.style.background = 'rgba(0, 0, 0, 0.9)';
    countdownTimerElement!.style.transform = 'scale(1)';
    
    // Remove cancel text overlay
    const cancelText = countdownTimerElement!.querySelector('#cancel-overlay');
    if (cancelText) {
      cancelText.remove();
    }
  });
  
  // Add click handler to cancel timer
  countdownTimerElement.addEventListener('click', () => {
    countdownTimerElement?.remove();
    countdownTimerElement = null;
    chrome.storage.local.remove('countdownTimer');
    updateContainerVisibility();
  });
  
  function updateTimer() {
    if (!countdownTimerElement) return;
    
    // Calculate remaining time based on stored start time and current time
    chrome.storage.local.get(['countdownTimer'], (result) => {
      if (!result.countdownTimer) {
        // Timer was removed, clean up
        countdownTimerElement?.remove();
        countdownTimerElement = null;
        updateContainerVisibility();
        return;
      }
      
      const { startTime, remainingSeconds: originalRemainingSeconds } = result.countdownTimer;
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const actualRemainingSeconds = Math.max(0, originalRemainingSeconds - elapsedSeconds);
      
      if (actualRemainingSeconds <= 0) {
        countdownTimerElement.textContent = "Time's up!";
        countdownTimerElement.style.background = 'rgba(220, 38, 38, 0.9)';
        countdownTimerElement.style.cursor = 'pointer';
        countdownTimerElement.title = 'Click to dismiss';
        setTimeout(() => {
          countdownTimerElement?.remove();
          countdownTimerElement = null;
          chrome.storage.local.remove('countdownTimer');
          updateContainerVisibility();
        }, 3000);
        return;
      }
      
      // Format as mm:ss
      const mins = Math.floor(actualRemainingSeconds / 60);
      const secs = actualRemainingSeconds % 60;
      countdownTimerElement.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
      countdownTimerElement.title = 'Click to cancel timer';
      
      // Keep black background always
      countdownTimerElement.style.background = 'rgba(0, 0, 0, 0.9)';
      
      // Schedule next update in 1 second
      setTimeout(updateTimer, 1000);
    });
  }
  
  // Add to container (timer gets priority - first position)
  const container = getTopRightContainer();
  container.insertBefore(countdownTimerElement, container.firstChild);
  updateContainerVisibility();
  updateTimer();
}

// Function to remove countdown timer element
function removeCountdownTimerElement() {
  if (countdownTimerElement) {
    countdownTimerElement.remove();
    countdownTimerElement = null;
    updateContainerVisibility();
  }
}

// Function to check if a timer already exists
async function hasExistingTimer(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['countdownTimer'], (result) => {
      if (result.countdownTimer) {
        const { startTime, remainingSeconds } = result.countdownTimer;
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const actualRemainingSeconds = Math.max(0, remainingSeconds - elapsedSeconds);
        resolve(actualRemainingSeconds > 0);
      } else {
        resolve(false);
      }
    });
  });
}

// Function to check if a pinned task already exists
async function hasExistingPinnedTask(): Promise<boolean> {
  return new Promise((resolve) => {
    chrome.storage.local.get(['pinnedTask'], (result) => {
      resolve(!!result.pinnedTask);
    });
  });
}


function showConfirmation(message: string) {
  const content = modal!.querySelector('#modal-content') as HTMLElement;
  
  // Check for reduced motion preference - Accessibility first
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  
  if (prefersReducedMotion) {
    // Instant confirmation for users who prefer reduced motion
    content.innerHTML = `
      <div style="text-align: center; padding: ${UI_CONSTANTS.SPACING.LG};">
        <div style="margin-bottom: ${UI_CONSTANTS.SPACING.MD};">
          <svg width="48" height="48" fill="none" stroke="${UI_CONSTANTS.COLORS.SUCCESS}" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
        <div style="font-size: ${UI_CONSTANTS.FONT_SIZE.LG}; font-weight: ${UI_CONSTANTS.FONT_WEIGHT.SEMIBOLD}; color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY}; line-height: 1.4;">${message}</div>
      </div>
    `;
    
    // Auto close after a short delay
    setTimeout(() => {
      closeModal();
    }, ANIMATION_CONSTANTS.TIMING.CONFIRMATION_AUTO_CLOSE);
  } else {
    // Natural animation with spring-like easing for delightful motion
    input!.style.opacity = ANIMATION_CONSTANTS.OPACITY.HIDDEN.toString();
    input!.style.transition = `opacity ${ANIMATION_CONSTANTS.TIMING.CONFIRMATION_FADE_OUT}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
    
    setTimeout(() => {
      // Replace with confirmation
      content.innerHTML = `
        <div style="text-align: center; padding: ${UI_CONSTANTS.SPACING.LG};">
          <div style="margin-bottom: ${UI_CONSTANTS.SPACING.MD};">
            <svg width="48" height="48" fill="none" stroke="${UI_CONSTANTS.COLORS.SUCCESS}" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div style="font-size: ${UI_CONSTANTS.FONT_SIZE.LG}; font-weight: ${UI_CONSTANTS.FONT_WEIGHT.SEMIBOLD}; color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY}; line-height: 1.4;">${message}</div>
        </div>
      `;
      
      // Fade in confirmation with natural spring-like motion
      content.style.opacity = ANIMATION_CONSTANTS.OPACITY.HIDDEN.toString();
      content.style.transition = `opacity ${ANIMATION_CONSTANTS.TIMING.CONFIRMATION_FADE_IN}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
      
      requestAnimationFrame(() => {
        content.style.opacity = ANIMATION_CONSTANTS.OPACITY.VISIBLE.toString();
      });
      
      // Auto close
      setTimeout(() => {
        closeModal();
      }, ANIMATION_CONSTANTS.TIMING.CONFIRMATION_AUTO_CLOSE);
    }, ANIMATION_CONSTANTS.TIMING.CONFIRMATION_FADE_OUT);
  }
}

// Create countdown timer in top right corner
let countdownTimer: HTMLElement | null = null;
let countdownInterval: ReturnType<typeof setInterval> | null = null;
let lastRemainingSeconds: number | null = null;

function createCountdownTimer() {
  if (countdownTimer) return;
  countdownTimer = document.createElement('div');
  countdownTimer.style.cssText = `
    position: fixed;
    top: 10px;
    right: 10px;
    background: rgba(0, 0, 0, 0.8);
    color: white;
    padding: 8px 12px;
    border-radius: 6px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    font-weight: 600;
    z-index: ${MODAL_CONSTANTS.Z_INDEX.COUNTDOWN_TIMER};
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
    letter-spacing: 1px;
  `;
  countdownTimer.textContent = 'Loading...';
  document.body.appendChild(countdownTimer);
}

function updateCountdown(remainingSeconds: number) {
  if (!countdownTimer) {
    createCountdownTimer();
  }
  lastRemainingSeconds = remainingSeconds;
  if (remainingSeconds <= 0) {
    countdownTimer!.textContent = `0' 00"`;
    countdownTimer!.style.background = 'rgba(220, 38, 38, 0.9)';
    setTimeout(() => {
      window.location.href = chrome.runtime.getURL('focus-page.html');
    }, 1000);
  } else {
    const minutes = Math.floor(remainingSeconds / 60);
    const seconds = remainingSeconds % 60;
    countdownTimer!.textContent = `${minutes}' ${seconds.toString().padStart(2, '0')}"`;
    countdownTimer!.style.background = remainingSeconds < 600 ? 'rgba(245, 158, 11, 0.9)' : 'rgba(0, 0, 0, 0.8)';
  }
}

function startTimeTracking(domain: string) {
  // Clear existing interval
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  // Get initial time in seconds
  chrome.runtime.sendMessage({
    type: FEATURE_CONSTANTS.MESSAGE_TYPES.GET_DOMAIN_TIME_INFO,
    domain: domain
  }).then(response => {
    if (response && response.remainingMinutes !== undefined) {
      // Convert to seconds
      let remainingSeconds = Math.max(0, Math.round(response.remainingMinutes * 60));
      updateCountdown(remainingSeconds);
      // Start ticking every second
      countdownInterval = setInterval(() => {
        if (lastRemainingSeconds !== null) {
          updateCountdown(lastRemainingSeconds - 1);
        }
      }, 1000);
    }
  }).catch(error => {
    console.error('Error getting domain time info:', error);
  });
}

console.log('Content script loaded on:', window.location.href);

// Function to create pinned task element
function createPinnedTaskElement(text: string) {
  // Remove existing pinned task
  if (pinnedTaskElement) {
    pinnedTaskElement.remove();
    pinnedTaskElement = null;
  }
  
  // Create pinned task element
  pinnedTaskElement = document.createElement('div');
  pinnedTaskElement.style.cssText = `
    max-width: 212px;
    background: ${UI_CONSTANTS.COLORS.BACKGROUND_SECONDARY};
    border: 1px solid ${UI_CONSTANTS.COLORS.BORDER_PRIMARY};
    border-radius: 12px 0 0 12px;
    padding: 12px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    line-height: 1.4;
    word-wrap: break-word;
    white-space: pre-wrap;
    pointer-events: auto;
    position: relative;
  `;
  
  // Add close button
  const closeButton = document.createElement('button');
  closeButton.innerHTML = '✕';
  closeButton.style.cssText = `
    position: absolute;
    top: 8px;
    right: 8px;
    background: none;
    border: none;
    color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY};
    cursor: pointer;
    font-size: 14px;
    padding: 4px;
    border-radius: 4px;
    transition: background-color 0.2s;
  `;
  
  closeButton.addEventListener('click', () => {
    pinnedTaskElement?.remove();
    pinnedTaskElement = null;
    // Remove from storage when closed
    chrome.storage.local.remove('pinnedTask');
    updateContainerVisibility();
  });
  
  closeButton.addEventListener('mouseenter', () => {
    closeButton.style.background = 'rgba(255, 255, 255, 0.1)';
  });
  
  closeButton.addEventListener('mouseleave', () => {
    closeButton.style.background = 'none';
  });
  
  pinnedTaskElement.appendChild(closeButton);
  
  // Add the text content
  const textContent = document.createElement('div');
  textContent.innerHTML = text;
  pinnedTaskElement.appendChild(textContent);
  
  // Add to container (pinned task goes after timer)
  const container = getTopRightContainer();
  container.appendChild(pinnedTaskElement);
  updateContainerVisibility();
}

// Function to remove pinned task element
function removePinnedTaskElement() {
  if (pinnedTaskElement) {
    pinnedTaskElement.remove();
    pinnedTaskElement = null;
  }
}

// Check for existing pinned task on page load
chrome.storage.local.get(['pinnedTask'], (result) => {
  if (result.pinnedTask) {
    createPinnedTaskElement(result.pinnedTask);
  }
});

// Check for existing countdown timer on page load
chrome.storage.local.get(['countdownTimer'], (result) => {
  if (result.countdownTimer) {
    const { startTime, remainingSeconds } = result.countdownTimer;
    const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
    const actualRemainingSeconds = Math.max(0, remainingSeconds - elapsedSeconds);
    
    if (actualRemainingSeconds > 0) {
      createCountdownTimerElement();
    } else {
      chrome.storage.local.remove('countdownTimer');
    }
  }
});

// Listen for storage changes to sync pinned tasks and timers across tabs
chrome.storage.onChanged.addListener((changes, namespace) => {
  if (namespace === 'local') {
    // Handle pinned task changes
    if (changes.pinnedTask) {
      const { newValue, oldValue } = changes.pinnedTask;
      
      if (newValue && newValue !== oldValue) {
        createPinnedTaskElement(newValue);
      } else if (!newValue && oldValue) {
        removePinnedTaskElement();
      }
    }
    
    // Handle countdown timer changes
    if (changes.countdownTimer) {
      const { newValue, oldValue } = changes.countdownTimer;
      
      if (newValue && newValue !== oldValue) {
        const { startTime, remainingSeconds } = newValue;
        const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
        const actualRemainingSeconds = Math.max(0, remainingSeconds - elapsedSeconds);
        
        if (actualRemainingSeconds > 0) {
          createCountdownTimerElement();
        } else {
          chrome.storage.local.remove('countdownTimer');
        }
      } else if (!newValue && oldValue) {
        removeCountdownTimerElement();
      }
    }
  }
});

// Helper to get the root domain for tracking
function getRootDomain(url: string) {
  try {
    const { hostname } = new URL(url);
    // For domains like www.pinterest.com, return pinterest.com
    const parts = hostname.split('.');
    if (parts.length > 2) {
      return parts.slice(-2).join('.');
    }
    return hostname;
  } catch {
    return url;
  }
}

// On page load, check for distracting domain and start timer if needed
chrome.runtime.sendMessage({ 
  type: FEATURE_CONSTANTS.MESSAGE_TYPES.CHECK_DISTRACTING_DOMAIN, 
  url: window.location.href 
}).then(response => {
  const rootDomain = getRootDomain(window.location.href);
  if (response && response.shouldBlock) {
    window.location.href = chrome.runtime.getURL('focus-page.html');
  } else if (response && response.shouldShowOverlay) {
    startTimeTracking(rootDomain);
  }
}).catch(error => {
  console.error('Error checking distracting domain:', error);
});

// Initialize YouTube distraction blocking if on YouTube
let youtubeBlocker: YouTubeDistractionBlocker | null = null;
if (isYouTubePage()) {
  // Get configuration from storage
  chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' }).then(data => {
    if (data && data.config && data.config.youtubeDistraction) {
      youtubeBlocker = new YouTubeDistractionBlocker(data.config.youtubeDistraction);
    } else {
      youtubeBlocker = new YouTubeDistractionBlocker();
    }
    youtubeBlocker.start();
  }).catch(error => {
    console.error('Error getting YouTube distraction config:', error);
    youtubeBlocker = new YouTubeDistractionBlocker();
    youtubeBlocker.start();
  });
}

// Initialize video focus manager if supported
let videoFocusManager: VideoFocusManager | null = null;
if (supportsVideoFocus()) {
  chrome.runtime.sendMessage({ type: 'GET_STORAGE_DATA' }).then(data => {
    if (data && data.config && data.config.videoFocus) {
      videoFocusManager = new VideoFocusManager(data.config.videoFocus);
    } else {
      videoFocusManager = new VideoFocusManager({
        enabled: true,
        preventTabSwitch: true,
        showIndicator: true,
        allowedDomains: [],
        autoDetectVideos: true
      });
    }
    videoFocusManager.start();
  }).catch(error => {
    console.error('Error getting video focus config:', error);
    videoFocusManager = new VideoFocusManager({
      enabled: true,
      preventTabSwitch: true,
      showIndicator: true,
      allowedDomains: [],
      autoDetectVideos: true
    });
    videoFocusManager.start();
  });
}

// Track if this is a reload vs navigation
let isReload = false;

// Detect if this is a reload (not navigation)
if (performance.getEntriesByType('navigation').length > 0) {
  const navigationEntry = performance.getEntriesByType('navigation')[0] as PerformanceNavigationTiming;
  isReload = navigationEntry.type === 'reload';
}

// If it's a reload, clear the modal state for this domain
if (isReload) {
  const rootDomain = getRootDomain(window.location.href);
  chrome.runtime.sendMessage({
    type: FEATURE_CONSTANTS.MESSAGE_TYPES.CLEAR_MODAL_STATE,
    domain: rootDomain
  }).catch(error => {
    console.error('Error clearing modal state:', error);
  });
}

// Clean up overlays when page is about to unload
window.addEventListener('beforeunload', () => {
  // Also clean up any managers
  if (youtubeBlocker) {
    youtubeBlocker.stop();
  }
  if (videoFocusManager) {
    videoFocusManager.stop();
  }
  // Clean up countdown timer
  if (countdownInterval) {
    clearInterval(countdownInterval);
  }
  if (countdownTimer) {
    countdownTimer.remove();
  }
});

// Listen for messages from background script
chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
  if (message.type === 'PLAY_EYE_CARE_END_SOUND') {
    playAudioWithFallback('sounds/eye-care-beep.mp3', message.volume || 0.5, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.type === 'PLAY_EYE_CARE_START_SOUND') {
    playAudioWithFallback('sounds/eye-care-start.mp3', message.volume || 0.5, sendResponse);
    return true; // Keep message channel open for async response
  }
  
  if (message.type === FEATURE_CONSTANTS.MESSAGE_TYPES.SHOW_SMART_SEARCH_MODAL) {
    toggleModal();
    sendResponse({ success: true });
    return true;
  }

  if (message.type === 'CHECK_DISTRACTING_DOMAIN') {
    // Check if current page is a distracting domain
    chrome.runtime.sendMessage({ 
      type: FEATURE_CONSTANTS.MESSAGE_TYPES.CHECK_DISTRACTING_DOMAIN, 
      url: window.location.href 
    }).then(response => {
      if (response && response.shouldBlock) {
        // Redirect to focus page
        window.location.href = chrome.runtime.getURL('focus-page.html');
      } else if (response && response.shouldShowOverlay) {
        // Show overlay with remaining visits
        startTimeTracking(response.domain);
      }
    }).catch(error => {
      console.error('Error checking distracting domain:', error);
    });
    return true;
  }

  if (message.type === 'UPDATE_YOUTUBE_DISTRACTION_CONFIG') {
    if (youtubeBlocker && isYouTubePage()) {
      youtubeBlocker.updateConfig(message.config);
      sendResponse({ success: true });
    } else {
      sendResponse({ error: 'YouTube blocker not available or not on YouTube' });
    }
    return true;
  }

  if (message.type === 'UPDATE_VIDEO_FOCUS_CONFIG') {
    if (videoFocusManager && supportsVideoFocus()) {
      videoFocusManager.updateConfig(message.config);
      sendResponse({ success: true });
    } else {
      sendResponse({ error: 'Video focus manager not available or not on supported platform' });
    }
    return true;
  }

  if (message.type === 'VIDEO_FOCUS_BLOCKED_TAB_SWITCH') {
    // Show a notification that tab switching was blocked
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: white;
      padding: 20px;
      border-radius: 10px;
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      font-size: 16px;
      z-index: 999999;
      text-align: center;
      max-width: 300px;
    `;
    notification.innerHTML = `
      <div style="margin-bottom: 10px;">
        <svg width="24" height="24" fill="none" stroke="currentColor" viewBox="0 0 24 24" style="display: inline-block; vertical-align: middle;">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
        </svg>
      </div>
      <div>${message.message}</div>
      <div style="font-size: 14px; margin-top: 10px; opacity: 0.8;">
        Return to video tab to continue
      </div>
    `;
    document.body.appendChild(notification);
    
    setTimeout(() => {
      notification.remove();
    }, 3000);
    
    sendResponse({ success: true });
    return true;
  }
});

// Improved audio playing function with better error handling and fallbacks
async function playAudioWithFallback(audioPath: string, volume: number, sendResponse: (response: any) => void) {
  try {
    // Check if we're on a restricted page
    if (window.location.protocol === 'chrome:' || window.location.protocol === 'chrome-extension:') {
      console.log('Audio playback not allowed on chrome:// URLs');
      sendResponse({ error: 'Audio not allowed on this page' });
      return;
    }

    // Check if user has interacted with the page (required for autoplay)
    if (!document.hasFocus() || document.visibilityState !== 'visible') {
      console.log('Page not focused or visible, using fallback methods');
      await tryFallbackMethods(sendResponse);
      return;
    }

    // Try to create and play audio
    const audio = new Audio(chrome.runtime.getURL(audioPath));
    audio.volume = volume;
    
    // Add error handling for audio loading
    audio.addEventListener('error', (e) => {
      console.error('Audio loading error:', e);
      // Try fallback methods
      tryFallbackMethods(sendResponse);
    });
    
    // Try to play the audio
    try {
      await audio.play();
      sendResponse({ success: true });
    } catch (playError) {
      console.error('Error playing audio:', playError);
      // Try fallback methods
      await tryFallbackMethods(sendResponse);
    }
  } catch (error) {
    console.error('Error creating audio:', error);
    // Try fallback methods
    await tryFallbackMethods(sendResponse);
  }
}

// Fallback methods when audio fails
async function tryFallbackMethods(sendResponse: (response: any) => void) {
  // Method 1: Try vibration (if supported and user has interacted)
  try {
    if (typeof navigator.vibrate === 'function') {
      // Check if user has interacted with the page and vibration is allowed
      if (document.hasFocus() && document.visibilityState === 'visible') {
        // Use a shorter vibration pattern to avoid blocking
        navigator.vibrate(100);
        sendResponse({ success: true, method: 'vibration' });
        return;
      }
    }
  } catch (vibrationError) {
    console.error('Vibration failed:', vibrationError);
  }

  // Method 2: Try to create a simple beep using Web Audio API
  try {
    if (typeof AudioContext !== 'undefined' || typeof (window as any).webkitAudioContext !== 'undefined') {
      const audioContext = new (AudioContext || (window as any).webkitAudioContext)();
      
      // Resume audio context if it's suspended (required for autoplay policy)
      if (audioContext.state === 'suspended') {
        await audioContext.resume();
      }
      
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();
      
      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);
      
      oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
      gainNode.gain.setValueAtTime(0.05, audioContext.currentTime); // Lower volume
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
      
      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
      
      sendResponse({ success: true, method: 'web-audio' });
      return;
    }
  } catch (webAudioError) {
    console.error('Web Audio API failed:', webAudioError);
  }

  // Method 3: Try to show a visual notification
  try {
    showVisualNotification();
    sendResponse({ success: true, method: 'visual' });
    return;
  } catch (visualError) {
    console.error('Visual notification failed:', visualError);
  }

  // If all methods fail
  sendResponse({ error: 'All audio methods failed' });
}

// Visual notification fallback
function showVisualNotification() {
  const notification = document.createElement('div');
  notification.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 14px;
    z-index: 999999;
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    animation: fadeInOut 2s ease-in-out;
  `;
  
  // Add CSS animation
  const style = document.createElement('style');
  style.textContent = `
    @keyframes fadeInOut {
      0% { opacity: 0; transform: translateY(-10px); }
      20% { opacity: 1; transform: translateY(0); }
      80% { opacity: 1; transform: translateY(0); }
      100% { opacity: 0; transform: translateY(-10px); }
    }
  `;
  
  notification.textContent = '👁️ Eye Care Reminder';
  document.head.appendChild(style);
  document.body.appendChild(notification);
  
  // Remove after animation
  setTimeout(() => {
    notification.remove();
    style.remove();
  }, 2000);
}

// Create or get the top-right container for stacking pinned tasks and timers
function getTopRightContainer(): HTMLElement {
  if (!topRightContainer) {
    topRightContainer = document.createElement('div');
    topRightContainer.id = 'unwavering-focus-top-right-container';
    topRightContainer.style.cssText = `
      position: fixed;
      top: 72px;
      right: 0;
      z-index: ${MODAL_CONSTANTS.Z_INDEX.COUNTDOWN_TIMER};
      display: flex;
      flex-direction: column;
      gap: 12px;
      pointer-events: none;
      transition: opacity 0.3s ease;
    `;
    document.body.appendChild(topRightContainer);
    
    // Add scroll listener for transparency effect
    let scrollTimeout: ReturnType<typeof setTimeout> | null = null;
    let isScrolling = false;
    
    window.addEventListener('scroll', () => {
      if (!isScrolling) {
        isScrolling = true;
        topRightContainer!.style.opacity = '0.3'; // More transparent when scrolling
      }
      
      // Clear existing timeout
      if (scrollTimeout) {
        clearTimeout(scrollTimeout);
      }
      
      // Reset opacity after scrolling stops
      scrollTimeout = setTimeout(() => {
        isScrolling = false;
        topRightContainer!.style.opacity = '1'; // Full opacity when not scrolling
      }, 150); // 150ms delay after scroll stops
    });
  }
  return topRightContainer;
}

// Function to update container visibility
function updateContainerVisibility() {
  if (topRightContainer) {
    const hasChildren = topRightContainer.children.length > 0;
    topRightContainer.style.display = hasChildren ? 'flex' : 'none';
  }
}