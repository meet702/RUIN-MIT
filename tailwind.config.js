/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        ruin: {
          background: "#0E0E0E",
          card: "#1A1A1A",
          orange: "#F26522",
          yellow: "#FFE11A",
          magenta: "#FF2D6F",
          text: "#F0EDE6",
          muted: "#7A7672",
          border: "#2A2A2A",
        },
      },
      fontFamily: {
        heading: ['"Space Grotesk"', "sans-serif"],
        body: ['"DM Sans"', "sans-serif"],
      },
    },
  },
  plugins: [],
};
