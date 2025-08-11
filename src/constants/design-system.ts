// Apple Watch Design System for Unwavering Focus Extension
// Based on Apple Watch Human Interface Guidelines
export const DESIGN_SYSTEM = {
  // Color Palette - Apple Watch Style
  COLORS: {
    // Background Colors - Dark theme only (Apple Watch standard)
    BACKGROUND: {
      PRIMARY: '#000000',
      SECONDARY: '#1c1c1e',
      TERTIARY: '#2c2c2e',
    },

    // Text Colors - High contrast for readability
    TEXT: {
      PRIMARY: '#ffffff',
      SECONDARY: '#8e8e93',
      TERTIARY: '#48484a',
    },

    // Accent Colors - Apple Watch standard
    ACCENT: {
      PRIMARY: '#007aff', // Apple Blue
      SUCCESS: '#34c759', // Apple Green
      WARNING: '#ff9500', // Apple Orange
      ERROR: '#ff3b30', // Apple Red
    },

    // Border Colors - Subtle and minimal
    BORDER: {
      PRIMARY: '#38383a',
      SECONDARY: 'rgba(255, 255, 255, 0.1)',
    },
  },

  // Typography - Apple Watch Style
  TYPOGRAPHY: {
    // Font Family - Apple Watch standard
    FONT_FAMILY: {
      PRIMARY: [
        'SF Pro Display',
        '-apple-system',
        'BlinkMacSystemFont',
        'sans-serif',
      ],
    },

    // Font Sizes - Apple Watch optimized
    FONT_SIZE: {
      XS: '10px', // Small labels
      SM: '12px', // Body text
      MD: '14px', // Headers
      LG: '16px', // Large headers
      XL: '18px', // Important text
    },

    // Font Weights - Apple Watch standard
    FONT_WEIGHT: {
      NORMAL: 400,
      MEDIUM: 500,
      SEMIBOLD: 600,
    },

    // Line Heights - Optimized for small screens
    LINE_HEIGHT: {
      TIGHT: 1.2,
      NORMAL: 1.3,
    },
  },

  // Spacing - Apple Watch optimized
  SPACING: {
    XS: '4px',
    SM: '8px',
    MD: '12px',
    LG: '16px',
    XL: '20px',
  },

  // Border Radius - Apple Watch standard
  BORDER_RADIUS: {
    NONE: '0px',
    SM: '6px',
    MD: '8px',
    LG: '12px',
  },

  // Shadows - Minimal and subtle
  SHADOW: {
    NONE: 'none',
    SM: '0 1px 3px rgba(0, 0, 0, 0.2)',
  },

  // Layout - Apple Watch dimensions
  LAYOUT: {
    CONTAINER: {
      POPUP_WIDTH: '300px',
      POPUP_HEIGHT: '485px',
    },

    Z_INDEX: {
      BASE: 1,
      MODAL: 1000,
    },
  },

  // Animation - Following Emil Kowalski's principles for great animations
  // https://emilkowal.ski/ui/great-animations#great-animations-are-fast
  ANIMATION: {
    // Timing - Fast animations for better perceived performance
    TIMING: {
      QUICK: '200ms', // Under 300ms for snappy feel
      NORMAL: '250ms', // Slightly longer for natural exit
      SPRING: '180ms', // Spring-like for natural motion
    },

    // Easing - Using Material Design curves for natural motion
    EASING: {
      LINEAR: 'linear',
      EASE_OUT: 'cubic-bezier(0.0, 0.0, 0.2, 1)', // Material Design ease-out
      EASE_IN: 'cubic-bezier(0.4, 0.0, 1, 1)', // Material Design ease-in
      SPRING: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)', // Natural spring feel
    },

    // Transitions - Hardware accelerated transforms only
    TRANSITION: {
      QUICK:
        'transform 200ms cubic-bezier(0.0, 0.0, 0.2, 1), opacity 200ms cubic-bezier(0.0, 0.0, 0.2, 1)',
      NORMAL:
        'transform 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94), opacity 250ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      SPRING: 'transform 180ms cubic-bezier(0.25, 0.46, 0.45, 0.94)',
    },
  },

  // Component Variants - Apple Watch Style
  COMPONENTS: {
    // Button Variants - Simple and clear
    BUTTON: {
      PRIMARY: {
        background: '#007aff',
        color: '#ffffff',
        hover: {
          background: '#0056cc',
        },
      },
      SECONDARY: {
        background: '#2c2c2e',
        color: '#ffffff',
        hover: {
          background: '#1c1c1e',
        },
      },
      SUCCESS: {
        background: '#34c759',
        color: '#ffffff',
      },
      DANGER: {
        background: '#ff3b30',
        color: '#ffffff',
      },
    },

    // Card Variants - Clean and simple
    CARD: {
      DEFAULT: {
        background: '#1c1c1e',
        border: '1px solid #2c2c2e',
        borderRadius: '8px',
        shadow: 'none',
      },
      INTERACTIVE: {
        background: '#1c1c1e',
        border: '1px solid #2c2c2e',
        borderRadius: '8px',
        shadow: 'none',
      },
    },

    // Input Variants - Simple and functional
    INPUT: {
      DEFAULT: {
        background: '#2c2c2e',
        border: '1px solid #38383a',
        color: '#ffffff',
        borderRadius: '6px',
      },
      FOCUSED: {
        background: '#2c2c2e',
        border: '1px solid #007aff',
        color: '#ffffff',
        borderRadius: '6px',
      },
    },
  },
} as const;

// Utility functions for consistent styling
export const designSystemUtils = {
  // Color utilities
  getColor: (colorPath: string) => {
    const path = colorPath.split('.');
    let value: any = DESIGN_SYSTEM.COLORS;
    for (const key of path) {
      value = value[key];
    }
    return value;
  },

  // Spacing utilities
  getSpacing: (size: keyof typeof DESIGN_SYSTEM.SPACING) => {
    return DESIGN_SYSTEM.SPACING[size];
  },

  // Typography utilities
  getTypography: (
    type: 'fontSize' | 'fontWeight' | 'lineHeight',
    size: string
  ) => {
    const typographyMap = {
      fontSize: DESIGN_SYSTEM.TYPOGRAPHY.FONT_SIZE,
      fontWeight: DESIGN_SYSTEM.TYPOGRAPHY.FONT_WEIGHT,
      lineHeight: DESIGN_SYSTEM.TYPOGRAPHY.LINE_HEIGHT,
    };
    return (typographyMap[type] as any)[size];
  },

  // Animation utilities
  getAnimation: (type: 'timing' | 'easing' | 'transition', value: string) => {
    const animationMap = {
      timing: DESIGN_SYSTEM.ANIMATION.TIMING,
      easing: DESIGN_SYSTEM.ANIMATION.EASING,
      transition: DESIGN_SYSTEM.ANIMATION.TRANSITION,
    };
    return (animationMap[type] as any)[value];
  },
};

// Export individual sections for easier imports
export const COLORS = DESIGN_SYSTEM.COLORS;
export const TYPOGRAPHY = DESIGN_SYSTEM.TYPOGRAPHY;
export const SPACING = DESIGN_SYSTEM.SPACING;
export const BORDER_RADIUS = DESIGN_SYSTEM.BORDER_RADIUS;
export const SHADOW = DESIGN_SYSTEM.SHADOW;
export const LAYOUT = DESIGN_SYSTEM.LAYOUT;
export const ANIMATION = DESIGN_SYSTEM.ANIMATION;
export const COMPONENTS = DESIGN_SYSTEM.COMPONENTS;
