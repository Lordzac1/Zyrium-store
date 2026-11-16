/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: { zy: { bg: "#07050D", card: "#0D0918" } },
      fontFamily: {
        display: ["Chakra Petch", "sans-serif"],
        body: ["Manrope", "sans-serif"],
      },
      keyframes: {
        pulseGrad: {
          "0%,100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
      },
      animation: { pulseGrad: "pulseGrad 3s ease-in-out infinite" },
    },
  },
  plugins: [],
};
