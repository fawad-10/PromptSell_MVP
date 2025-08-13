/** @type {import('tailwindcss').Config} */
const config = {
  content: [
    "./src/pages/**/*.{js,jsx,mdx}",
    "./src/components/**/*.{js,jsx,mdx}",
    "./src/app/**/*.{js,jsx,mdx}",
    "./src/lib/**/*.{js,jsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        fiverr: {
          green: "#1dbf73",
          "green-dark": "#19a463",
          text: "#404145",
          "text-light": "#74767e",
          border: "#e4e5e7",
          "border-light": "#c5c6c9",
          bg: "#f7f7f7",
        },
      },
      fontFamily: {
        macan: ["Macan", "Helvetica Neue", "Helvetica", "Arial", "sans-serif"],
      },
    },
  },
  plugins: [require("daisyui")],
};

module.exports = config;
