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
        'bg-primary': '#000000',
        'bg-secondary': '#1c1c1e',
        'bg-tertiary': '#2c2c2e',
        'text-primary': '#ffffff',
        'text-secondary': '#8e8e93',
        'text-muted': '#48484a',
        'border-color': '#38383a',
        'accent-primary': '#007aff',
        'accent-secondary': '#5856d6',
        'success-color': '#34c759',
        'danger-color': '#ff3b30',
        'warning-color': '#ff9500',
        'info-color': '#5ac8fa',
        'shadow': 'rgba(0, 0, 0, 0.3)',
        'glass-bg': 'rgba(28, 28, 30, 0.8)',
        'glass-border': 'rgba(255, 255, 255, 0.1)',
      },
      fontFamily: {
        'apple': ['SF Pro Display', '-apple-system', 'BlinkMacSystemFont', 'sans-serif'],
      },
      spacing: {
        'xs': '3px',
        'sm': '6px',
        'md': '8px',
        'lg': '12px',
        'xl': '16px',
      },
      fontSize: {
        'xs': '9px',
        'sm': '11px',
        'md': '12px',
        'lg': '14px',
        'xl': '16px',
        'xxl': '18px',
      },
      borderRadius: {
        'apple': '8px',
      },
      animation: {
        'slideDown': 'slideDown 0.3s ease-out',
      },
    },
  },
  plugins: [],
} 