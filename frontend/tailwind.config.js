/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        zyrium: {
          bg: '#050B16',
          surface: '#0B1628',
          primary: '#2878FF',
          secondary: '#8B35F5',
          accent: '#00D2FF',
        },
      },
    },
  },
  plugins: [],
};
