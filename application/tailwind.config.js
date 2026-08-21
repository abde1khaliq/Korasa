/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        paper: "#F7F5F1",
        "paper-card": "#FBFAF8",
        ink: "#2B2724",
        "ink-soft": "#6E655C",
        "ink-faint": "#9C9086",
        rule: "#E4DED4",
        brand: "#A8703F",
        onyx: "#2A2724",
        easy: "#3F7D5C",
        "easy-soft": "#E3F1E9",
        medium: "#A17A2E",
        "medium-soft": "#F1E6C9",
        hard: "#A34A34",
        "hard-soft": "#F3E3DE",
        tag: "#EFE2CD",
      },
    },
  },
  plugins: [],
};