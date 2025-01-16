/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Montserrat', 'sans-serif'],
      },
      colors: {
        brand: {
          blue: {
            light: '#DFF2EB',
            medium: '#B9E5E8',
            dark: '#7AB2D3',
            darker: '#4A628A',
          }
        },
      },
      animation: {
        'scroll-x': 'scroll-x 40s linear infinite',
      },
      keyframes: {
        'scroll-x': {
          from: { transform: 'translateX(0)' },
          to: { transform: 'translateX(-100%)' },
        },
      },
      backgroundImage: {
        'gradient-radial': 'radial-gradient(var(--tw-gradient-stops))',
      },
    },
  },
  plugins: [],
};