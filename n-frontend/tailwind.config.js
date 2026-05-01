/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#2563eb',
          dark: '#1d4ed8',
          light: '#eff6ff',
        },
        secondary: {
          DEFAULT: '#64748b',
          dark: '#475569',
          light: '#f1f5f9',
        },
        accent: '#f59e0b',
        success: '#10b981',
        danger: '#ef4444',
        warning: '#f59e0b',
        info: '#3b82f6',
      },
      borderRadius: {
        'xl': '1rem',
        '2xl': '1.5rem',
      },
      boxShadow: {
        'glass': '0 8px 32px 0 rgba(31, 38, 135, 0.07)',
        'premium': '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -4px rgba(0, 0, 0, 0.1)',
      },
      fontFamily: {
        inter: ['"Times New Roman"', 'Times', 'serif'],
        outfit: ['"Times New Roman"', 'Times', 'serif'],
      },
    },
  },
  plugins: [],
}
