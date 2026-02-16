/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#D4AF37", // Gold
        background: "#1A0F0A", // Deep Dark Brown
        surface: "#2D1B14", // Dark Brown
        border: "#5C4033", // Medieval Brown
        foreground: "#F5E6D3", // Parchment
        muted: "#A68D7B", // Faded Brown
        gold: "#D4AF37",
        bronze: "#CD7F32",
      },
    },
  },
  plugins: [],
}
