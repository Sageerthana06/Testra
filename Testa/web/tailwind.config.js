/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  darkMode: 'class',

  theme: {
    extend: {
      colors: {
        // Primary Gold Theme
        gold: {
          light: '#F7E7B4',
          DEFAULT: '#D4AF37',
          dark: '#AA7C11',
          glow: 'rgba(212, 175, 55, 0.15)',
        },

        // Red Theme
        sriRed: {
          light: '#FEE2E2',
          DEFAULT: '#EF4444',
          dark: '#B91C1C',
          glow: 'rgba(239, 68, 68, 0.2)',
        },

        // Yellow Theme
        sriYellow: {
          light: '#FEF3C7',
          DEFAULT: '#F59E0B',
          dark: '#B45309',
          glow: 'rgba(245, 158, 11, 0.2)',
        },

        // Green Theme
        sriGreen: {
          light: '#DCFCE7',
          DEFAULT: '#10B981',
          dark: '#047857',
          glow: 'rgba(16, 185, 129, 0.2)',
        },

        // Blue Theme (Optional)
        primary: {
          light: '#93C5FD',
          DEFAULT: '#3B82F6',
          dark: '#1D4ED8',
        },

        // Dark Dashboard Colors
        slate: {
          950: '#0B0F19',
          900: '#0F172A',
          800: '#1E293B',
          700: '#334155',
        },

        // Background Colors
        background: {
          light: '#F8FAFC',
          dark: '#0F172A',
        },
      },

      fontFamily: {
        sans: ['Outfit', 'Inter', 'sans-serif'],
        heading: ['Poppins', 'sans-serif'],
      },

      backdropBlur: {
        xs: '2px',
      },

      boxShadow: {
        glowGold: '0 0 20px rgba(212, 175, 55, 0.25)',
        glowRed: '0 0 20px rgba(239, 68, 68, 0.25)',
        glowYellow: '0 0 20px rgba(245, 158, 11, 0.25)',
        glowGreen: '0 0 20px rgba(16, 185, 129, 0.25)',
      },

      borderRadius: {
        xl: '1rem',
        '2xl': '1.5rem',
      },

      animation: {
        float: 'float 3s ease-in-out infinite',
        fadeIn: 'fadeIn 0.5s ease-in-out',
      },

      keyframes: {
        float: {
          '0%, 100%': {
            transform: 'translateY(0px)',
          },
          '50%': {
            transform: 'translateY(-8px)',
          },
        },

        fadeIn: {
          '0%': {
            opacity: '0',
          },
          '100%': {
            opacity: '1',
          },
        },
      },
    },
  },

  plugins: [],
};