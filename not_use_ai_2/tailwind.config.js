/** @type {import('tailwindcss').Config} */
export default {

  darkMode: 'class', // ✅ এখানে add করো

  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],

  theme: {

    extend: {

      animation: {
        'fade-up': 'fade-up 0.8s ease-out 0.3s forwards',
      },
      keyframes: {
        'fade-up': {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        }
      }
      
    },

  },

  plugins: [],



}