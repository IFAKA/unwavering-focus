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
let actionsList: HTMLElement | null = null;
let isAnimating = false;
let focusAttempts = 0;
const MAX_FOCUS_ATTEMPTS = 25; // Very high number for maximum reliability

// Command palette state
let selectedActionIndex = 0;
let pinnedTaskElement: HTMLElement | null = null;
let previousActionBeforeTimer = 0; // Store previous action before switching to timer

// Focus management state
let focusTimeoutId: ReturnType<typeof setTimeout> | null = null;
let isFocusAttempting = false;

// Clean up any existing overlays on page load/refresh
document.addEventListener('DOMContentLoaded', () => {
  const existingOverlays = document.querySelectorAll('[data-extension="unwavering-focus"]');
  existingOverlays.forEach(overlay => overlay.remove());
});

// Keyboard shortcut listener
document.addEventListener('keydown', (e) => {
  if (e.altKey && e.shiftKey && e.key === 'S') {
    e.preventDefault();
    toggleModal();
  }
});

function toggleModal() {
  if (modal && modal.style.display === 'block') {
    closeModal();
  } else {
    openModal();
  }
}

function openModal() {
  if (isAnimating) return;
  isAnimating = true;
  focusAttempts = 0;
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
  actionsList = null;
  
  // Create modal
  createModal();
  
  // Ensure modal was created successfully
  if (!modal) {
    console.error('Failed to create modal');
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
      const content = modal.querySelector('#modal-content') as HTMLElement;
      if (content) {
        content.style.transition = 'none';
      }
      
      // Show modal instantly
      modal.style.display = 'block';
      modal.style.opacity = ANIMATION_CONSTANTS.OPACITY.VISIBLE.toString();
      if (content) {
        content.style.transform = MODAL_CONSTANTS.TRANSFORM.FINAL;
      }
      
      // Focus after ensuring DOM is fully ready
      focusTimeoutId = setTimeout(() => {
        attemptFocus();
      }, 50);
    }
  } else {
    // Natural animation with spring-like easing for delightful motion
    if (modal) {
      modal.style.transition = `opacity ${ANIMATION_CONSTANTS.TIMING.QUICK_OPEN}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
      const content = modal.querySelector('#modal-content') as HTMLElement;
      if (content) {
        content.style.transition = `transform ${ANIMATION_CONSTANTS.TIMING.QUICK_OPEN}ms ${ANIMATION_CONSTANTS.EASING.SPRING}`;
      }
      
      // Show modal
      modal.style.display = 'block';
      modal.style.opacity = ANIMATION_CONSTANTS.OPACITY.HIDDEN.toString();
      
      // Animate in with natural spring-like motion
      requestAnimationFrame(() => {
        if (modal) {
          modal.style.opacity = ANIMATION_CONSTANTS.OPACITY.VISIBLE.toString();
          if (content) {
            content.style.transform = MODAL_CONSTANTS.TRANSFORM.FINAL;
          }
          
          // Start focus attempts after animation starts
          focusTimeoutId = setTimeout(() => {
            attemptFocus();
          }, 150);
        }
      });
    }
  }
}

function attemptFocus() {
  if (isFocusAttempting) return; // Prevent multiple simultaneous focus attempts
  if (focusAttempts >= MAX_FOCUS_ATTEMPTS) {
    console.warn('Failed to focus input after maximum attempts');
    isAnimating = false;
    isFocusAttempting = false;
    return;
  }
  
  isFocusAttempting = true;
  focusAttempts++;
  
  // Ensure we have a valid input element
  if (!input) {
    console.warn('Input element not found, attempting to recreate');
    resetModalContent();
    
    // Try again after a short delay
    focusTimeoutId = setTimeout(() => {
      isFocusAttempting = false;
      attemptFocus();
    }, 150);
    return;
  }
  
  // Comprehensive visibility and readiness checks
  const isInputReady = () => {
    try {
      // Check if input exists and is in DOM
      if (!input || !document.contains(input)) {
        return false;
      }
      
      // Check if input is visible
      if (input.style.display === 'none' || input.style.visibility === 'hidden') {
        return false;
      }
      
      // Check if input has dimensions
      if (input.offsetWidth <= 0 || input.offsetHeight <= 0) {
        return false;
      }
      
      // Check if input is not hidden by CSS
      if (input.offsetParent === null) {
        return false;
      }
      
      // Force a reflow to ensure the input is properly rendered
      input.offsetHeight;
      
      return true;
    } catch (error) {
      console.warn('Input readiness check failed:', error);
      return false;
    }
  };
  
  if (isInputReady()) {
    try {
      // Multiple focus strategies
      const focusStrategies = [
        () => input!.focus(),
        () => input!.click(),
        () => {
          input!.focus();
          input!.click();
        },
        () => {
          input!.focus();
          // Force selection
          if (input!.value) {
            input!.select();
          } else {
            input!.setSelectionRange(input!.value.length, input!.value.length);
          }
        }
      ];
      
      // Try each strategy
      for (const strategy of focusStrategies) {
        try {
          strategy();
          
          // Verify focus was successful
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
        } catch (strategyError) {
          console.warn('Focus strategy failed:', strategyError);
        }
      }
    } catch (error) {
      console.warn('Focus attempt failed:', error);
    }
  }
  
  // If focus failed, try again with different timing strategies
  isFocusAttempting = false;
  
  if (focusAttempts <= 10) {
    // First attempts use requestAnimationFrame for immediate response
    requestAnimationFrame(() => {
      attemptFocus();
    });
  } else if (focusAttempts <= 20) {
    // Middle attempts use short timeouts
    focusTimeoutId = setTimeout(() => {
      attemptFocus();
    }, 150);
  } else {
    // Later attempts use longer timeouts
    focusTimeoutId = setTimeout(() => {
      attemptFocus();
    }, 300);
  }
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
  
  // Clear content and recreate command palette
  content.innerHTML = '';
  selectedActionIndex = 0;
  
  // Get selected text if any
  const selectedText = window.getSelection()?.toString().trim() || '';
  
  // Create input (now a textarea for formatted text support)
  input = document.createElement('textarea');
  input.placeholder = 'Type your command or thought...';
  input.autocomplete = 'off'; // Prevent browser autocomplete interference
  input.value = selectedText; // Pre-populate with selected text
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
  
  // Add focus styles for better interaction feedback
  input.addEventListener('focus', () => {
    input!.style.borderColor = MODAL_CONSTANTS.CONTENT.FOCUS_BORDER_COLOR;
    input!.style.boxShadow = MODAL_CONSTANTS.CONTENT.FOCUS_BOX_SHADOW;
  });
  
  input.addEventListener('blur', () => {
    input!.style.borderColor = MODAL_CONSTANTS.CONTENT.BORDER_COLOR;
    input!.style.boxShadow = 'none';
  });
  
  // Create actions list
  actionsList = document.createElement('div');
  actionsList.style.cssText = `
    max-height: ${MODAL_CONSTANTS.COMMAND_PALETTE.MAX_HEIGHT};
    overflow-y: auto;
    padding: ${MODAL_CONSTANTS.COMMAND_PALETTE.SCROLL_PADDING};
  `;
  
  // Create action items with Apple Watch-style design
  MODAL_CONSTANTS.ACTIONS.forEach((action, index) => {
    const actionItem = document.createElement('div');
    actionItem.className = 'action-item';
    actionItem.dataset.actionId = action.id;
    actionItem.style.cssText = `
      display: flex;
      align-items: center;
      padding: ${MODAL_CONSTANTS.COMMAND_PALETTE.ITEM_PADDING};
      margin: ${MODAL_CONSTANTS.COMMAND_PALETTE.ITEM_MARGIN};
      border-radius: ${MODAL_CONSTANTS.COMMAND_PALETTE.ITEM_BORDER_RADIUS};
      cursor: pointer;
      transition: ${UI_CONSTANTS.TRANSITIONS.FAST};
      background: ${index === 0 ? 'rgba(0, 122, 255, 0.1)' : 'transparent'};
      border: 1px solid ${index === 0 ? 'rgba(0, 122, 255, 0.3)' : 'transparent'};
      font-family: -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', Roboto, sans-serif;
      min-height: ${UI_CONSTANTS.LAYOUT.TOUCH_TARGET_MIN};
    `;
    
    actionItem.innerHTML = `
      <span style="font-size: 20px; margin-right: ${UI_CONSTANTS.SPACING.MD}; opacity: 0.9;">${action.icon}</span>
      <div style="flex: 1;">
        <div style="font-weight: ${UI_CONSTANTS.FONT_WEIGHT.SEMIBOLD}; color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY}; margin-bottom: 2px; font-size: ${UI_CONSTANTS.FONT_SIZE.MD};">${action.title}</div>
        <div style="font-size: ${UI_CONSTANTS.FONT_SIZE.SM}; color: ${UI_CONSTANTS.COLORS.TEXT_SECONDARY}; opacity: 0.8; line-height: 1.3;">${action.description}</div>
      </div>
    `;
    
    // Add hover effects for better interactivity
    actionItem.addEventListener('mouseenter', () => {
      if (index !== selectedActionIndex) {
        actionItem.style.background = 'rgba(255, 255, 255, 0.05)';
        actionItem.style.transform = 'translateY(-1px)';
      }
    });
    
    actionItem.addEventListener('mouseleave', () => {
      if (index !== selectedActionIndex) {
        actionItem.style.background = 'transparent';
        actionItem.style.transform = 'translateY(0)';
      }
    });
    
    actionItem.addEventListener('click', () => {
      executeAction(action.id, input!.value);
    });
    
    if (actionsList) {
      actionsList.appendChild(actionItem);
    }
  });
  
  // Add keyboard event listener for command palette navigation
  input.addEventListener('keydown', handleCommandPaletteKeydown);
  input.addEventListener('input', handleInputChange); // Add input event listener for smart selection
  
  // Append elements to content
  content.appendChild(input);
  content.appendChild(actionsList);
  
  // Initialize smart selection based on pre-populated text
  if (selectedText) {
    handleInputChange();
  }
  
  // Force a reflow to ensure proper rendering
  input.offsetHeight;
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

// Handle command palette keyboard navigation
function handleCommandPaletteKeydown(e: KeyboardEvent) {
  if (e.key === 'Enter' && !e.shiftKey) {
    e.preventDefault();
    
    // Smart input detection for intelligent default actions
    const inputValue = input!.value.trim();
    
    if (inputValue === '') {
      // Empty input: default to box breathing
      executeAction('box-breathing', '');
    } else if (/^\d+$/.test(inputValue)) {
      // Only numbers: default to timer
      executeAction('timer', inputValue);
    } else {
      // Mixed content: use currently selected action
      const selectedAction = MODAL_CONSTANTS.ACTIONS[selectedActionIndex];
      if (selectedAction) {
        executeAction(selectedAction.id, inputValue);
      }
    }
  } else if (e.key === 'Escape') {
    closeModal();
  } else if (e.key === 'ArrowDown' || (e.shiftKey && e.key === 'J')) {
    e.preventDefault();
    selectNextAction();
  } else if (e.key === 'ArrowUp' || (e.shiftKey && e.key === 'K')) {
    e.preventDefault();
    selectPreviousAction();
  }
}

// Smart input detection for automatic action selection
function handleInputChange() {
  if (!input) return;
  
  const inputValue = input.value.trim();
  const previousSelectedIndex = selectedActionIndex;
  
  if (inputValue === '') {
    // Empty input: select box breathing (index 2)
    selectedActionIndex = 2;
  } else if (/^\d+$/.test(inputValue)) {
    // Only numbers: select timer (index 3)
    selectedActionIndex = 3;
  } else {
    // Mixed content: if we were previously on timer (numbers), go back to previous selection
    // Store the previous selection before switching to timer
    if (previousSelectedIndex === 3) {
      // If we were on timer and now have mixed content, go back to the stored previous selection
      selectedActionIndex = previousActionBeforeTimer || 0;
    } else {
      // Store current selection as previous (unless it's timer)
      if (previousSelectedIndex !== 3) {
        previousActionBeforeTimer = previousSelectedIndex;
      }
      selectedActionIndex = previousSelectedIndex >= 0 ? previousSelectedIndex : 0;
    }
  }
  
  // Update visual selection if it changed
  if (selectedActionIndex !== previousSelectedIndex) {
    updateActionSelection();
    
    // Add subtle visual feedback for automatic selection
    const selectedAction = MODAL_CONSTANTS.ACTIONS[selectedActionIndex];
    if (selectedAction) {
      // Update input placeholder to show the selected action
      const originalPlaceholder = 'Type your command or thought...';
      if (inputValue === '' && selectedActionIndex === 2) {
        input.placeholder = 'Press Enter to start box breathing session';
      } else if (/^\d+$/.test(inputValue) && selectedActionIndex === 3) {
        input.placeholder = `Press Enter to start ${inputValue}-minute timer`;
      } else {
        input.placeholder = originalPlaceholder;
      }
    }
  }
}

function selectNextAction() {
  selectedActionIndex = (selectedActionIndex + 1) % MODAL_CONSTANTS.ACTIONS.length;
  updateActionSelection();
}

function selectPreviousAction() {
  selectedActionIndex = selectedActionIndex === 0 
    ? MODAL_CONSTANTS.ACTIONS.length - 1 
    : selectedActionIndex - 1;
  updateActionSelection();
}

function updateActionSelection() {
  if (!actionsList) return;
  const actionItems = actionsList.querySelectorAll('.action-item');
  if (!actionItems) return;
  
  actionItems.forEach((item, index) => {
    const element = item as HTMLElement;
    if (index === selectedActionIndex) {
      // Selected state with smooth transition
      element.style.background = 'rgba(0, 122, 255, 0.15)';
      element.style.border = '1px solid rgba(0, 122, 255, 0.4)';
      element.style.transform = 'translateY(-2px) scale(1.02)';
      element.style.boxShadow = UI_CONSTANTS.SHADOWS.SMALL;
      element.scrollIntoView({ block: 'nearest', behavior: 'smooth' });
    } else {
      // Unselected state
      element.style.background = 'transparent';
      element.style.border = '1px solid transparent';
      element.style.transform = 'translateY(0) scale(1)';
      element.style.boxShadow = 'none';
    }
  });
}

// Execute selected action
function executeAction(actionId: string, text: string) {
  switch (actionId) {
    case 'save-thought':
      saveThought(text);
      break;
    case 'pin-task':
      pinTask(text);
      break;
    case 'box-breathing':
      startBoxBreathing(text);
      break;
    case 'timer':
      startTimer(text);
      break;
    default:
      console.warn('Unknown action:', actionId);
  }
}

function saveThought(text: string) {
  if (!text.trim()) return;
  
  // Save to storage
  chrome.runtime.sendMessage({
    type: FEATURE_CONSTANTS.MESSAGE_TYPES.SAVE_SEARCH,
    query: text
  }).then(() => {
    showConfirmation('Thought saved for later');
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
  
  // Create box breathing visualizer
  const breathingElement = document.createElement('div');
  breathingElement.style.cssText = `
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.8);
    backdrop-filter: blur(10px);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: ${MODAL_CONSTANTS.Z_INDEX.MODAL};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  `;
  
  // Create the breathing circle
  const circle = document.createElement('div');
  circle.style.cssText = `
    width: 200px;
    height: 200px;
    border: 3px solid ${UI_CONSTANTS.COLORS.ACCENT_PRIMARY};
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    font-size: 24px;
    font-weight: 600;
    transition: all 4s ease-in-out;
    position: relative;
  `;
  
  // Create instruction text
  const instruction = document.createElement('div');
  instruction.style.cssText = `
    position: absolute;
    bottom: 40px;
    left: 50%;
    transform: translateX(-50%);
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    font-size: 18px;
    text-align: center;
    max-width: 400px;
    line-height: 1.4;
  `;
  
  if (text.trim()) {
    instruction.innerHTML = `
      <div style="margin-bottom: 16px; font-size: 16px; opacity: 0.8;">Focus on:</div>
      <div style="white-space: pre-wrap;">${text}</div>
    `;
  } else {
    instruction.innerHTML = `
      <div style="font-size: 16px; opacity: 0.8;">Press ESC or click outside to stop</div>
    `;
  }
  
  breathingElement.appendChild(circle);
  breathingElement.appendChild(instruction);
  document.body.appendChild(breathingElement);
  
  // Box breathing phases: Inhale (4s) → Hold (4s) → Exhale (4s) → Hold (4s)
  const phases = [
    { name: 'Inhale', duration: 4000, scale: 1.2, opacity: 1 },
    { name: 'Hold', duration: 4000, scale: 1.2, opacity: 0.8 },
    { name: 'Exhale', duration: 4000, scale: 0.8, opacity: 0.6 },
    { name: 'Hold', duration: 4000, scale: 0.8, opacity: 0.4 }
  ];
  
  let currentPhase = 0;
  let isActive = true;
  
  function updateBreathing() {
    if (!isActive) return;
    
    const phase = phases[currentPhase];
    circle.textContent = phase.name;
    circle.style.transform = `scale(${phase.scale})`;
    circle.style.opacity = phase.opacity.toString();
    circle.style.borderColor = phase.name === 'Inhale' || phase.name === 'Exhale' 
      ? UI_CONSTANTS.COLORS.ACCENT_PRIMARY 
      : UI_CONSTANTS.COLORS.TEXT_SECONDARY;
    
    setTimeout(() => {
      if (isActive) {
        currentPhase = (currentPhase + 1) % phases.length;
        updateBreathing();
      }
    }, phase.duration);
  }
  
  // Start the breathing cycle
  updateBreathing();
  
  // Handle close events
  const closeBreathing = () => {
    isActive = false;
    breathingElement.remove();
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
  
  showConfirmation('Box breathing session started');
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
function createCountdownTimerElement(remainingSeconds: number) {
  // Remove existing timer
  const existingTimer = document.getElementById('unwavering-focus-timer');
  if (existingTimer) {
    existingTimer.remove();
  }
  
  // Create countdown timer
  const timerElement = document.createElement('div');
  timerElement.id = 'unwavering-focus-timer';
  timerElement.style.cssText = `
    position: fixed;
    bottom: 20px;
    right: 20px;
    background: rgba(0, 0, 0, 0.9);
    color: white;
    padding: 12px 16px;
    border-radius: 8px;
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    font-size: 16px;
    font-weight: 600;
    z-index: ${MODAL_CONSTANTS.Z_INDEX.COUNTDOWN_TIMER};
    backdrop-filter: blur(10px);
    border: 1px solid rgba(255, 255, 255, 0.1);
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
    min-width: 80px;
    text-align: center;
  `;
  
  function updateTimer() {
    if (remainingSeconds <= 0) {
      timerElement.textContent = "Time's up!";
      timerElement.style.background = 'rgba(220, 38, 38, 0.9)';
      setTimeout(() => {
        timerElement.remove();
        chrome.storage.local.remove('countdownTimer');
      }, 3000);
      return;
    }
    
    // Format as mm:ss
    const mins = Math.floor(remainingSeconds / 60);
    const secs = remainingSeconds % 60;
    timerElement.textContent = `${mins}:${secs.toString().padStart(2, '0')}`;
    
    // Change color when less than 10 minutes remaining
    if (remainingSeconds < 600) {
      timerElement.style.background = 'rgba(245, 158, 11, 0.9)';
    }
    
    remainingSeconds--;
    setTimeout(updateTimer, 1000);
  }
  
  document.body.appendChild(timerElement);
  updateTimer();
}

// Function to remove countdown timer element
function removeCountdownTimerElement() {
  const existingTimer = document.getElementById('unwavering-focus-timer');
  if (existingTimer) {
    existingTimer.remove();
  }
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
  }
  
  // Create pinned task element
  pinnedTaskElement = document.createElement('div');
  pinnedTaskElement.style.cssText = `
    position: fixed;
    top: 20px;
    right: 20px;
    max-width: 300px;
    background: ${UI_CONSTANTS.COLORS.BACKGROUND_SECONDARY};
    border: 1px solid ${UI_CONSTANTS.COLORS.BORDER_PRIMARY};
    border-radius: 12px;
    padding: 16px;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.3);
    backdrop-filter: blur(10px);
    z-index: ${MODAL_CONSTANTS.Z_INDEX.PINNED_TASK};
    font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    color: ${UI_CONSTANTS.COLORS.TEXT_PRIMARY};
    line-height: 1.4;
    word-wrap: break-word;
    white-space: pre-wrap;
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
  
  document.body.appendChild(pinnedTaskElement);
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
      createCountdownTimerElement(actualRemainingSeconds);
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
          createCountdownTimerElement(actualRemainingSeconds);
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
  console.log('YouTube page detected, initializing distraction blocker');
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
  console.log('Video platform detected, initializing video focus manager');
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
    console.log('Content script: Received UPDATE_YOUTUBE_DISTRACTION_CONFIG message:', message);
    if (youtubeBlocker && isYouTubePage()) {
      console.log('Content script: Updating YouTube blocker config');
      youtubeBlocker.updateConfig(message.config);
      sendResponse({ success: true });
    } else {
      console.log('Content script: YouTube blocker not available or not on YouTube');
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