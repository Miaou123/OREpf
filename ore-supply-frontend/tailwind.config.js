/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        // Dark theme
        background: '#0a0a0a',
        surface: '#1a1a1a',
        'surface-elevated': '#252525',
        border: '#333333',
        
        // Text
        'text-primary': '#ffffff',
        'text-secondary': '#a0a0a0',
        'text-muted': '#666666',
        
        // Accents
        'accent-yellow': '#FFD700',
        'accent-blue': '#4A90E2',
        'accent-green': '#4AE290',
        'accent-purple': '#9D4AE2',
        'accent-orange': '#FF6B35', // PUMPORE brand color
        
        // Status
        success: '#10b981',
        warning: '#f59e0b',
        error: '#ef4444',
      },
      fontFamily: {
        sans: ['Inter', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace'],
      },
      fontSize: {
        xs: '12px',
        sm: '14px',
        base: '16px',
        lg: '18px',
        xl: '20px',
        '2xl': '24px',
        '3xl': '30px',
        '4xl': '36px',
      },
      spacing: {
        '18': '72px', // Header height
      },
    },
  },
  plugins: [],
}