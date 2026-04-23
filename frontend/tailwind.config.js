/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        primary: "#0f172a",
        secondary: "#334155",
        accent: "#3b82f6",
        success: "#10b981",
        warning: "#f59e0b",
        danger: "#ef4444",
        background: "#f8fafc",
        card: "#ffffff",
        border: "#e2e8f0",
      }
    },
  },
  plugins: [],
}
