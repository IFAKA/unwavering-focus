// Modal Constants
export const MODAL_CONSTANTS = {
  // Z-index values
  Z_INDEX: {
    MODAL: 999999,
    COUNTDOWN_TIMER: 999998,
  },
  
  // Modal positioning and sizing
  POSITION: {
    TOP: 0,
    LEFT: 0,
    WIDTH: '100%',
    HEIGHT: '100%',
  },
  
  // Modal styling
  STYLING: {
    BACKGROUND_OPACITY: 0.5,
    BACKDROP_BLUR: '10px',
    BORDER_RADIUS: '16px',
    PADDING: '20px',
    MAX_WIDTH: '400px',
    WIDTH_PERCENTAGE: '90%',
  },
  
  // Input styling
  INPUT: {
    PADDING: '12px 16px',
    BORDER_RADIUS: '12px',
    FONT_SIZE: '16px',
    BORDER_WIDTH: '2px',
  },
  
  // Content styling
  CONTENT: {
    BACKGROUND_COLOR: '#1c1c1e',
    BORDER_COLOR: '#38383a',
    FOCUS_BORDER_COLOR: '#007aff',
    FOCUS_BOX_SHADOW: '0 0 0 3px rgba(0, 122, 255, 0.1)',
    BOX_SHADOW: '0 20px 40px rgba(0, 0, 0, 0.3)',
  },
  
  // Transform values
  TRANSFORM: {
    INITIAL_TRANSLATE_Y: '-20px',
    INITIAL_SCALE: '0.95',
    FINAL_TRANSLATE_Y: '0',
    FINAL_SCALE: '1',
  },
} as const;
