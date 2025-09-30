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
        // Original Colors
        primary: '#1d3557',     // Dark Blue: App bars, main buttons, important headlines, primary icons.
        secondary: '#457b9d',   // Blue: Secondary buttons, subtitles, FABs, selection controls.
        tertiary: '#2a9d8f',    // Teal: Key highlights, progress bars, special offers, complementary icons.

        // New Extended Palette
        neutral: {
          50: '#f8f9fa',  // Light Gray: Primary background color for screens, cards, and sheets.
          500: '#6c757d', // Medium Gray: Secondary text, captions, disabled states, less important icons.
        },
        success: '#4caf50',     // Green: Success states, confirmation messages, positive trends.
        warning: '#ff9800',     // Amber: Warning states, medium-priority alerts, pending actions.
        error: '#e63946',       // Coral Red: Error states, destructive actions, failure messages.
        accent: {
          100: '#a8dadc', // Light Blue: Subtle accents, input field borders, selected tab indicators.
        }
      }
    },
  },
  plugins: [],
}