/** @type {import('tailwindcss').Config} */
module.exports = {
    content: [
      './app/**/*.{js,ts,jsx,tsx}',
      './pages/**/*.{js,ts,jsx,tsx}',
      './components/**/*.{js,ts,jsx,tsx}',
      './src/**/*.{js,ts,jsx,tsx}',
    ],
    theme: {
      extend: {
        colors: {
          'gold-400': '#FFC107',
        },
        keyframes: {
            slideInUp: {
              '0%': {
                opacity: 0,
                transform: 'translateY(30px)',
              },
              '100%': {
                opacity: 1,
                transform: 'translateY(0)',
              },
            },
          },
          animation: {
            slideInUp: 'slideInUp 0.4s ease-out forwards',
          },
        },
    },
    plugins: [
        require('@tailwindcss/typography'),
    ],
  };