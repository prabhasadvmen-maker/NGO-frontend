/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          50: '#E8F5E9',
          100: '#C8E6C9',
          200: '#A5D6A7',
          300: '#81C784',
          400: '#66BB6A',
          500: '#4CAF50',
          600: '#43A047',
          700: '#388E3C',
          800: '#2E7D32',
          900: '#1B5E20',
        },
        neo: {
          light: '#F5F5F5',
          lightShadow: '#FFFFFF',
          darkShadow: '#D0D0D0',
        },
      },
      boxShadow: {
        neo: '8px 8px 16px #D0D0D0, -8px -8px 16px #FFFFFF',
        'neo-inset': 'inset 8px 8px 16px #D0D0D0, inset -8px -8px 16px #FFFFFF',
        'neo-small': '4px 4px 8px #D0D0D0, -4px -4px 8px #FFFFFF',
      },
      borderRadius: {
        '3xl': '1.5rem',
      },
      animation: {
        'slide-in': 'slide-in 0.3s ease-out',
      },
      keyframes: {
        'slide-in': {
          from: {
            transform: 'translateY(-20px)',
            opacity: '0',
          },
          to: {
            transform: 'translateY(0)',
            opacity: '1',
          },
        },
      },
    },
  },
  plugins: [],
}
