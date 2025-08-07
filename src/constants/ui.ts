// UI Constants
export const UI_CONSTANTS = {
  // Colors
  COLORS: {
    // Background colors
    BACKGROUND_PRIMARY: '#000000',
    BACKGROUND_SECONDARY: '#1c1c1e',
    BACKGROUND_TERTIARY: '#2c2c2e',
    
    // Text colors
    TEXT_PRIMARY: '#ffffff',
    TEXT_SECONDARY: '#8e8e93',
    
    // Accent colors
    ACCENT_PRIMARY: '#007aff',
    ACCENT_SECONDARY: '#5856d6',
    
    // Status colors
    SUCCESS: '#34c759',
    WARNING: '#ff9500',
    ERROR: '#ff3b30',
    DANGER: '#ff3b30',
    
    // Border colors
    BORDER_PRIMARY: '#38383a',
    BORDER_SECONDARY: 'rgba(255, 255, 255, 0.1)',
  },
  
  // Spacing
  SPACING: {
    XS: '4px',
    SM: '8px',
    MD: '16px',
    LG: '24px',
    XL: '32px',
    XXL: '48px',
  },
  
  // Border radius
  BORDER_RADIUS: {
    SM: '6px',
    MD: '12px',
    LG: '16px',
    XL: '20px',
    FULL: '50%',
  },
  
  // Font sizes
  FONT_SIZE: {
    XS: '12px',
    SM: '14px',
    MD: '16px',
    LG: '18px',
    XL: '24px',
    XXL: '32px',
  },
  
  // Font weights
  FONT_WEIGHT: {
    NORMAL: 400,
    MEDIUM: 500,
    SEMIBOLD: 600,
    BOLD: 700,
  },
  
  // Layout dimensions
  LAYOUT: {
    POPUP_WIDTH: '300px',
    POPUP_HEIGHT: '485px',
    MODAL_MAX_WIDTH: '400px',
    MODAL_WIDTH_PERCENTAGE: '90%',
  },
  
  // Z-index values
  Z_INDEX: {
    BASE: 1,
    DROPDOWN: 100,
    MODAL: 1000,
    TOOLTIP: 2000,
    NOTIFICATION: 3000,
    EXTENSION_MODAL: 999999,
  },
} as const;
