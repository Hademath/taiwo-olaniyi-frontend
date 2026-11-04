/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        journal: { canvas: "#f4f7f3", surface: "#ffffff", ink: "#1a1a2e", muted: "#6b6e88", border: "#e0e1ec", green: "#2f4a8f", deep: "#1e2d5a", pale: "#eceef9", orange: "#ba6b29", blue: "#47768a" },
      },
      fontFamily: { sans: ["Plus Jakarta Sans", "sans-serif"], editorial: ["Newsreader", "Georgia", "serif"] },
      boxShadow: { card: "0 1px 2px rgb(23 27 46 / .04), 0 7px 22px rgb(23 27 46 / .035)" },
    },
  },
  plugins: [],
};