/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./app/**/*.{js,jsx,ts,tsx}", "./components/**/*.{js,jsx,ts,tsx}"],
  presets: [require("nativewind/preset")],
  darkMode: "class",
  theme: {
    extend: {
      fontFamily: {
        display: ["PlayfairDisplay_400Regular"],
        mono: ["JetBrainsMono_400Regular"]
      },
      colors: {
        paper: "var(--color-paper)",
        "paper-card": "var(--color-paper-card)",
        ink: "var(--color-ink)",
        "ink-soft": "var(--color-ink-soft)",
        "ink-faint": "var(--color-ink-faint)",
        rule: "var(--color-rule)",
        brand: "var(--color-brand)",
        onyx: "var(--color-onyx)",
        easy: "var(--color-easy)",
        "easy-soft": "var(--color-easy-soft)",
        medium: "var(--color-medium)",
        "medium-soft": "var(--color-medium-soft)",
        hard: "var(--color-hard)",
        "hard-soft": "var(--color-hard-soft)",
        tag: "var(--color-tag)",
      },
    },
  },
  plugins: [],
};