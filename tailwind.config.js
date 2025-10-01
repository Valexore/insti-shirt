/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./App.tsx", 
    "./components/**/*.{js,jsx,ts,tsx}",
    "./app/**/*.{js,jsx,ts,tsx}",
  ],
  presets: [require("nativewind/preset")],
  theme: {
    extend: {
      colors: {
        // Red & Burgundy Theme Colors
        primary: '#831843',     // Dark Burgundy: App bars, main buttons, important headlines, primary icons.
        secondary: '#be185d',   // Pink-Red: Secondary buttons, subtitles, FABs, selection controls.
        tertiary: '#9a3412',    // Burnt Orange: Key highlights, progress bars, special offers, complementary icons.

        // New Extended Palette
        neutral: {
          50: '#f8f9fa',  // Light Gray: Primary background color for screens, cards, and sheets.
          500: '#6c757d', // Medium Gray: Secondary text, captions, disabled states, less important icons.
        },
        success: '#166534',     // Dark Green: Success states, confirmation messages, positive trends.
        warning: '#d97706',     // Amber: Warning states, medium-priority alerts, pending actions.
        error: '#991b1b',       // Dark Red: Error states, destructive actions, failure messages.
        accent: {
          100: '#fecaca', // Light Red: Subtle accents, input field borders, selected tab indicators.
        }
      }
    },
  },
  plugins: [],
}