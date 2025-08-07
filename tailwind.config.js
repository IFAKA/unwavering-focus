/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./src/**/*.{js,jsx,ts,tsx,html}",
    "./src/**/*.html",
  ],
  theme: {
    extend: {
      colors: {
        // Apple Watch Design System Colors
        // Background Colors
        'bg-primary': '#000000',
        'bg-secondary': '#1c1c1e',
        'bg-tertiary': '#2c2c2e',
        
        // Text Colors
        'text-primary': '#ffffff',
        'text-secondary': '#8e8e93',
        'text-tertiary': '#48484a',
        
        // Accent Colors - Apple Watch standard
        'accent-primary': '#007aff',
        'accent-success': '#34c759',
        'accent-warning': '#ff9500',
        'accent-error': '#ff3b30',
        
        // Border Colors
        'border-primary': '#38383a',
        'border-secondary': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        'apple': ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      spacing: {
        'xs': '4px',
        'sm': '8px',
        'md': '12px',
        'lg': '16px',
        'xl': '20px',
      },
      fontSize: {
        'xs': '10px',
        'sm': '12px',
        'md': '14px',
        'lg': '16px',
        'xl': '18px',
      },
      fontWeight: {
        'normal': 400,
        'medium': 500,
        'semibold': 600,
      },
      lineHeight: {
        'tight': 1.2,
        'normal': 1.3,
      },
      borderRadius: {
        'none': '0px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
      },
      boxShadow: {
        'none': 'none',
        'sm': '0 1px 3px rgba(0, 0, 0, 0.2)',
      },
      animation: {
        'fadeIn': 'fadeIn 0.2s ease-out',
        'fadeOut': 'fadeOut 0.2s ease-out',
      },
      transitionDuration: {
        'quick': '150ms',
        'normal': '200ms',
      },
      transitionTimingFunction: {
        'ease-out': 'ease-out',
      },
      zIndex: {
        'base': 1,
        'modal': 1000,
      },
    },
  },
  plugins: [],
} 