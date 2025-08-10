// Modal Constants - Apple Watch Style with Great Animations
// Following Emil Kowalski's principles: https://emilkowal.ski/ui/great-animations
export const MODAL_CONSTANTS = {
  // Z-index values
  Z_INDEX: {
    MODAL: 999999,
    COUNTDOWN_TIMER: 999998,
    PINNED_TASK: 999997,
  },
  
  // Modal positioning and sizing
  POSITION: {
    TOP: 0,
    LEFT: 0,
    WIDTH: '100%',
    HEIGHT: '100%',
  },
  
  // Golden ratio positioning (φ ≈ 1.618) - Natural, pleasing positioning
  GOLDEN_RATIO: {
    VERTICAL_OFFSET: '38.2%', // 1/φ ≈ 0.382 = 38.2%
    HORIZONTAL_CENTER: '50%', // Keep horizontally centered
  },
  
  // Modal styling - Apple Watch inspired
  STYLING: {
    BACKGROUND_OPACITY: 0.6, // Slightly more opaque for better contrast
    BACKDROP_BLUR: '20px', // Stronger blur for depth
    BORDER_RADIUS: '20px', // More rounded for Apple Watch feel
    PADDING: '24px', // More generous padding
    MAX_WIDTH: '480px', // Optimized for readability
    WIDTH_PERCENTAGE: '85%', // Slightly narrower for focus
  },
  
  // Input styling - Apple Watch inspired
  INPUT: {
    PADDING: '16px 20px', // More generous padding
    BORDER_RADIUS: '16px', // More rounded
    FONT_SIZE: '17px', // Apple's preferred font size
    BORDER_WIDTH: '1px', // Thinner border for elegance
    MIN_HEIGHT: '52px', // Taller for better touch targets
    MAX_HEIGHT: '140px', // Slightly taller max height
  },
  
  // Content styling - Apple Watch inspired
  CONTENT: {
    BACKGROUND_COLOR: 'rgba(28, 28, 30, 0.95)', // Semi-transparent for depth
    BORDER_COLOR: 'rgba(255, 255, 255, 0.1)', // Subtle border
    FOCUS_BORDER_COLOR: '#007aff', // Apple blue
    FOCUS_BOX_SHADOW: '0 0 0 3px rgba(0, 122, 255, 0.15)', // Enhanced focus
    BOX_SHADOW: '0 25px 50px rgba(0, 0, 0, 0.4)', // Deeper shadow for depth
  },
  
  // Transform values for natural motion - Hardware accelerated
  TRANSFORM: {
    INITIAL_TRANSLATE_Y: '-16px', // Subtle initial offset
    INITIAL_SCALE: '0.92', // Slightly smaller initial scale
    FINAL_TRANSLATE_Y: '0',
    FINAL_SCALE: '1',
    // Combined transforms for golden ratio positioning
    INITIAL: 'translate(-50%, -50%) translateY(-16px) scale(0.92)',
    FINAL: 'translate(-50%, -50%) translateY(0) scale(1)',
    // Hover transforms for interactivity
    HOVER_SCALE: '1.02',
    HOVER_TRANSLATE_Y: '-2px',
  },
  
  // Command palette styling - Apple Watch inspired
  COMMAND_PALETTE: {
    MAX_HEIGHT: '320px', // Slightly taller
    ITEM_HEIGHT: '44px', // Apple's preferred touch target size
    ITEM_PADDING: '12px 20px', // More generous padding
    ITEM_BORDER_RADIUS: '12px', // More rounded
    ITEM_MARGIN: '6px 0', // More spacing between items
    SCROLL_PADDING: '12px', // More padding for scroll area
  },
  
  // Command palette actions - Enhanced with better descriptions
  ACTIONS: [
    {
      id: 'save-thought',
      title: 'Save Thought',
      description: 'Save current text for later review',
      icon: '💭',
    },
    {
      id: 'pin-task',
      title: 'Pin Task',
      description: 'Pin current text to top-right corner',
      icon: '📌',
    },
    {
      id: 'box-breathing',
      title: 'Box Breathing',
      description: 'Start a guided breathing session',
      icon: '🫁',
    },
    {
      id: 'timer',
      title: 'Start Timer',
      description: 'Start a countdown timer (input minutes)',
      icon: '⏱️',
    },
  ],
} as const;
