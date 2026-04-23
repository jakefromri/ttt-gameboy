/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      fontFamily: {
        marker: ['"Permanent Marker"', 'sans-serif'],
        display: ['"Fredoka"', '"Fredoka One"', 'sans-serif'],
      },
      colors: {
        crayon: {
          red: '#e84242',
          green: '#3fa14a',
          blue: '#3a7be0',
          yellow: '#f6c628',
          purple: '#8b55c8',
          orange: '#f08a2a',
          paper: '#fbf7ec',
        },
      },
      keyframes: {
        pop: {
          '0%':   { transform: 'scale(0) rotate(-20deg)', opacity: '0' },
          '60%':  { transform: 'scale(1.15) rotate(6deg)', opacity: '1' },
          '100%': { transform: 'scale(1) rotate(0deg)', opacity: '1' },
        },
        wiggle: {
          '0%, 100%': { transform: 'rotate(-1deg)' },
          '50%':      { transform: 'rotate(1deg)' },
        },
        bounceIn: {
          '0%':   { transform: 'translateY(40px) scale(0.9)', opacity: '0' },
          '100%': { transform: 'translateY(0) scale(1)', opacity: '1' },
        },
      },
      animation: {
        pop: 'pop 280ms cubic-bezier(.34,1.56,.64,1) forwards',
        wiggle: 'wiggle 1.2s ease-in-out infinite',
        bounceIn: 'bounceIn 350ms ease-out forwards',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
};
