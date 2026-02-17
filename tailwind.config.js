/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#FFD700", // Gold
        surface: "#18181b", // Zinc 900
        border: "#27272a", // Zinc 800
      }
    },
  },
  plugins: [],
}
