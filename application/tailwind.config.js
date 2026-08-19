/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        brand: "#3b82f6", // placeholder for brand
        easy: "#10b981",  // placeholder for easy
        hard: "#ef4444",  // placeholder for hard
      }
    },
  },
  plugins: [],
}
