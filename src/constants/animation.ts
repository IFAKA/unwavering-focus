// Animation Constants
export const ANIMATION_CONSTANTS = {
  // Timing values (in milliseconds)
  TIMING: {
    // Quick animations for opening
    QUICK_OPEN: 150,
    QUICK_FOCUS_DELAY: 150,
    
    // Quick animations for closing
    QUICK_CLOSE: 300,
    QUICK_CLOSE_DELAY: 300,
    
    // Confirmation animations
    CONFIRMATION_FADE_OUT: 150,
    CONFIRMATION_FADE_IN: 200,
    CONFIRMATION_DISPLAY: 800,
    CONFIRMATION_AUTO_CLOSE: 800,
    
    // Status feedback timing
    STATUS_DISPLAY: 2000,
    ERROR_DISPLAY: 3000,
    COPY_FEEDBACK: 800,
    
    // Eye care timing
    EYE_CARE_REMINDER_INTERVAL: 20 * 60 * 1000, // 20 minutes
    EYE_CARE_BREAK_DURATION: 20 * 1000, // 20 seconds
    EYE_CARE_GRACE_PERIOD: 20000, // 20 seconds grace period
  },
  
  // Transition easing
  EASING: {
    EASE_OUT: 'ease-out',
    EASE_IN: 'ease-in',
    LINEAR: 'linear',
  },
  
  // Opacity values
  OPACITY: {
    VISIBLE: 1,
    HIDDEN: 0,
    TRANSPARENT: 0,
  },
  
  // Scale values
  SCALE: {
    NORMAL: 1,
    SMALL: 0.95,
    LARGE: 1.1,
  },
  
  // Transform values
  TRANSFORM: {
    TRANSLATE_Y_UP: '-20px',
    TRANSLATE_Y_CENTER: '0',
    TRANSLATE_Y_DOWN: '20px',
  },
} as const;
