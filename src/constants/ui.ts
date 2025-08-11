// UI Constants - Apple Watch Style Design System
// Following Apple's Human Interface Guidelines
export const UI_CONSTANTS = {
  // Colors - Apple's system colors
  COLORS: {
    // Background colors - Dark mode optimized
    BACKGROUND_PRIMARY: '#000000',
    BACKGROUND_SECONDARY: 'rgba(28, 28, 30, 0.95)', // Semi-transparent for depth
    BACKGROUND_TERTIARY: 'rgba(44, 44, 46, 0.8)',

    // Text colors - High contrast for readability
    TEXT_PRIMARY: '#ffffff',
    TEXT_SECONDARY: '#8e8e93',
    TEXT_TERTIARY: '#636366',

    // Accent colors - Apple's system colors
    ACCENT_PRIMARY: '#007aff', // Apple blue
    ACCENT_SECONDARY: '#5856d6', // Apple purple
    ACCENT_TERTIARY: '#ff2d92', // Apple pink

    // Status colors - Apple's system colors
    SUCCESS: '#34c759', // Apple green
    WARNING: '#ff9500', // Apple orange
    ERROR: '#ff3b30', // Apple red
    DANGER: '#ff3b30', // Apple red

    // Border colors - Subtle and elegant
    BORDER_PRIMARY: 'rgba(255, 255, 255, 0.1)',
    BORDER_SECONDARY: 'rgba(255, 255, 255, 0.05)',
    BORDER_FOCUS: 'rgba(0, 122, 255, 0.3)',
  },

  // Spacing - Apple's 8pt grid system
  SPACING: {
    XS: '4px', // 0.5x
    SM: '8px', // 1x
    MD: '16px', // 2x
    LG: '24px', // 3x
    XL: '32px', // 4x
    XXL: '48px', // 6x
    XXXL: '64px', // 8x
  },

  // Border radius - Apple's rounded corners
  BORDER_RADIUS: {
    SM: '8px', // Small elements
    MD: '12px', // Medium elements
    LG: '16px', // Large elements
    XL: '20px', // Extra large elements
    FULL: '50%', // Circular elements
  },

  // Font sizes - Apple's typography scale
  FONT_SIZE: {
    XS: '13px', // Caption
    SM: '15px', // Body small
    MD: '17px', // Body (Apple's preferred)
    LG: '20px', // Headline
    XL: '24px', // Title
    XXL: '28px', // Large title
    XXXL: '34px', // Extra large title
  },

  // Font weights - Apple's typography weights
  FONT_WEIGHT: {
    LIGHT: 300,
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
  },

  // Layout dimensions - Apple Watch optimized
  LAYOUT: {
    POPUP_WIDTH: '320px', // Apple Watch app width
    POPUP_HEIGHT: '500px', // Optimized height
    MODAL_MAX_WIDTH: '480px', // Readable width
    MODAL_WIDTH_PERCENTAGE: '85%', // Responsive width
    TOUCH_TARGET_MIN: '44px', // Apple's minimum touch target
  },

  // Z-index values - Proper layering
  Z_INDEX: {
    BASE: 1,
    DROPDOWN: 100,
    MODAL: 1000,
    TOOLTIP: 2000,
    NOTIFICATION: 3000,
    EXTENSION_MODAL: 999999,
  },

  // Shadows - Apple's depth system
  SHADOWS: {
    SMALL: '0 2px 8px rgba(0, 0, 0, 0.12)',
    MEDIUM: '0 4px 16px rgba(0, 0, 0, 0.16)',
    LARGE: '0 8px 32px rgba(0, 0, 0, 0.24)',
    EXTRA_LARGE: '0 16px 64px rgba(0, 0, 0, 0.32)',
  },

  // Transitions - Apple's smooth animations
  TRANSITIONS: {
    FAST: '0.15s ease-out',
    NORMAL: '0.25s ease-out',
    SLOW: '0.35s ease-out',
    SPRING: '0.4s cubic-bezier(0.25, 0.46, 0.45, 0.94)',
  },
} as const;
