// Animation Constants - Following Emil Kowalski's animation principles
// https://emilkowal.ski/ui/great-animations#great-animations-are-fast
export const ANIMATION_CONSTANTS = {
  // Timing values (in milliseconds) - Fast animations for better perceived performance
  TIMING: {
    // Quick animations for opening - Under 300ms for snappy feel
    QUICK_OPEN: 200, // Reduced from 150ms for better balance
    QUICK_FOCUS_DELAY: 100, // Reduced for faster response
    
    // Quick animations for closing - Slightly longer for natural exit
    QUICK_CLOSE: 250, // Reduced from 300ms
    QUICK_CLOSE_DELAY: 250, // Reduced from 300ms
    
    // Confirmation animations - Fast feedback
    CONFIRMATION_FADE_OUT: 120, // Reduced from 150ms
    CONFIRMATION_FADE_IN: 150, // Reduced from 200ms
    CONFIRMATION_DISPLAY: 600, // Reduced from 800ms
    CONFIRMATION_AUTO_CLOSE: 600, // Reduced from 800ms
    
    // Status feedback timing - Quick but readable
    STATUS_DISPLAY: 1500, // Reduced from 2000ms
    ERROR_DISPLAY: 2500, // Reduced from 3000ms
    COPY_FEEDBACK: 600, // Reduced from 800ms
    
    // Eye care timing (unchanged - functional requirements)
    EYE_CARE_REMINDER_INTERVAL: 20 * 60 * 1000, // 20 minutes
    EYE_CARE_BREAK_DURATION: 20 * 1000, // 20 seconds
    EYE_CARE_GRACE_PERIOD: 20000, // 20 seconds grace period
  },
  
  // Transition easing - Using ease-out for snappy, responsive feel
  EASING: {
    EASE_OUT: 'cubic-bezier(0.0, 0.0, 0.2, 1)', // Material Design ease-out
    EASE_IN: 'cubic-bezier(0.4, 0.0, 1, 1)', // Material Design ease-in
    EASE_IN_OUT: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Material Design ease-in-out
    LINEAR: 'linear',
    // Spring-like easing for natural motion
    SPRING: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Natural spring feel
  },
  
  // Opacity values
  OPACITY: {
    VISIBLE: 1,
    HIDDEN: 0,
    TRANSPARENT: 0,
  },
  
  // Scale values - Subtle scaling for natural feel
  SCALE: {
    NORMAL: 1,
    SMALL: 0.96, // More subtle than 0.95
    LARGE: 1.02, // More subtle than 1.1
    SPRING_IN: 0.98, // Spring-like entrance
  },
  
  // Transform values - Hardware accelerated transforms only
  TRANSFORM: {
    TRANSLATE_Y_UP: '-16px', // Reduced from -20px for subtlety
    TRANSLATE_Y_CENTER: '0',
    TRANSLATE_Y_DOWN: '16px', // Reduced from 20px for subtlety
    SPRING_UP: '-12px', // Spring-like entrance
  },
  
  // Spring animation parameters for natural motion
  SPRING: {
    STIFFNESS: 300, // Higher stiffness for snappy feel
    DAMPING: 30, // Moderate damping for natural motion
    MASS: 1, // Standard mass
  },
} as const;
