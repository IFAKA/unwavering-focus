// Animation Constants - Following Emil Kowalski's animation principles
// https://emilkowal.ski/ui/great-animations#great-animations-are-fast
export const ANIMATION_CONSTANTS = {
  // Timing values (in milliseconds) - Fast animations for better perceived performance
  TIMING: {
    // Quick animations for opening - Under 300ms for snappy feel
    QUICK_OPEN: 180, // Fast but not jarring
    QUICK_FOCUS_DELAY: 80, // Minimal delay for immediate response
    
    // Quick animations for closing - Slightly longer for natural exit
    QUICK_CLOSE: 200, // Fast exit
    QUICK_CLOSE_DELAY: 200, // Reduced delay
    
    // Confirmation animations - Fast feedback
    CONFIRMATION_FADE_OUT: 100, // Very fast fade out
    CONFIRMATION_FADE_IN: 120, // Fast fade in
    CONFIRMATION_DISPLAY: 500, // Shorter display time
    CONFIRMATION_AUTO_CLOSE: 500, // Faster auto close
    
    // Status feedback timing - Quick but readable
    STATUS_DISPLAY: 1200, // Shorter for better UX
    ERROR_DISPLAY: 2000, // Shorter error display
    COPY_FEEDBACK: 400, // Very fast feedback
    
    // Eye care timing (unchanged - functional requirements)
    EYE_CARE_REMINDER_INTERVAL: 20 * 60 * 1000, // 20 minutes
    EYE_CARE_BREAK_DURATION: 20 * 1000, // 20 seconds
    EYE_CARE_GRACE_PERIOD: 20000, // 20 seconds grace period
  },
  
  // Transition easing - Using custom curves for better feel
  EASING: {
    // Default to ease-out for most interactions (feels responsive)
    EASE_OUT: 'cubic-bezier(0.0, 0.0, 0.2, 1)', // Material Design ease-out
    EASE_IN: 'cubic-bezier(0.4, 0.0, 1, 1)', // Material Design ease-in
    EASE_IN_OUT: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Material Design ease-in-out
    LINEAR: 'linear',
    // Spring-like easing for natural motion (feels alive)
    SPRING: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Natural spring feel
    // Custom easing for specific interactions
    BOUNCE: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)', // Bouncy feel
    SMOOTH: 'cubic-bezier(0.4, 0.0, 0.2, 1)', // Smooth transitions
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
    SMALL: 0.95, // Subtle scale down
    LARGE: 1.05, // Subtle scale up
    SPRING_IN: 0.98, // Spring-like entrance
    HOVER: 1.02, // Hover effect
  },
  
  // Transform values - Hardware accelerated transforms only
  TRANSFORM: {
    TRANSLATE_Y_UP: '-12px', // Subtle upward movement
    TRANSLATE_Y_CENTER: '0',
    TRANSLATE_Y_DOWN: '12px', // Subtle downward movement
    SPRING_UP: '-8px', // Spring-like entrance
    HOVER_UP: '-4px', // Hover effect
  },
  
  // Spring animation parameters for natural motion
  SPRING: {
    STIFFNESS: 400, // Higher stiffness for snappy feel
    DAMPING: 25, // Lower damping for more natural motion
    MASS: 0.8, // Lighter mass for faster response
  },
} as const;
