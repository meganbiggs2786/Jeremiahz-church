/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: "#006400", // Forest Green
        background: "#000000",
        surface: "#111111",
        border: "#222222",
        foreground: "#FFFFFF",
        muted: "#888888",
      },
    },
  },
  plugins: [],
}
