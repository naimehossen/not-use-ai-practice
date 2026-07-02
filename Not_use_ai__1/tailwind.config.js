/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      keyframes: {
        leftToRightReveal: {
          '0%': {
            transform: 'scaleX(0)',
            transformOrigin: 'left',
          },
          '100%': {
            transform: 'scaleX(1)',
            transformOrigin: 'left',
          },
        },
        textFloatUp: {
          '0%': {
            opacity: '0',
            transform: 'translateY(30px) scale(0.9)',
          },
          '100%': {
            opacity: '1',
            transform: 'translateY(0) scale(1)',
          },
        },
        subtlePulse: {
          '0%, 100%': {
            opacity: '0.7',
          },
          '50%': {
            opacity: '1',
          },
        }
      },
      animation: {
        leftToRightReveal: 'leftToRightReveal 2.5s cubic-bezier(0.4, 0, 0.2, 1) forwards',
        textFloatUp: 'textFloatUp 0.8s ease-out forwards',
        subtlePulse: 'subtlePulse 3s ease-in-out infinite',
      },
    },
  },
  plugins: [],
}