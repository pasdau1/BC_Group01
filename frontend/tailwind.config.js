/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./pages/**/*.{js,jsx,ts,tsx}",
    "./components/**/*.{js,jsx,ts,tsx}",
    "./src/**/*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        bg:    "#0f0f14",  // Seitenhintergrund
        card:  "#1c1c22",  // Boxen/Karten
        text:  "#e5e5e5",  // Standardschrift
        accent:"#22c55e",  // Akzent
      },
    },
  },
  plugins: [
    require("@tailwindcss/forms"),
    require("tailwindcss-animate"),
  ],
};
