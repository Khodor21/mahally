/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],

  theme: {
    extend: {
      fontFamily: {
        display: ["var(--font-display)", "sans-serif"],
        body: ["var(--font-body)", "sans-serif"],
      },

      colors: {
        brand: {
          primary: "rgb(var(--color-brand-primary) / <alpha-value>)",

          dark: "rgb(var(--color-dark) / <alpha-value>)",
          light: "rgb(var(--color-light) / <alpha-value>)",
          black: "rgb(var(--color-black) / <alpha-value>)",
          white: "rgb(var(--color-white) / <alpha-value>)",
          grey: "rgb(var(--color-grey) / <alpha-value>)",
        },
      },

      animation: {
        "fade-up": "fadeUp 0.6s ease forwards",
        "slide-in": "slideIn 0.4s ease forwards",
        "pulse-dot": "pulseDot 2s ease-in-out infinite",
      },

      keyframes: {
        fadeUp: {
          from: { opacity: 0, transform: "translateY(20px)" },
          to: { opacity: 1, transform: "translateY(0)" },
        },

        slideIn: {
          from: { opacity: 0, transform: "translateX(10px)" },
          to: { opacity: 1, transform: "translateX(0)" },
        },

        pulseDot: {
          "0%, 100%": { opacity: 1, transform: "scale(1)" },
          "50%": { opacity: 0.5, transform: "scale(0.8)" },
        },
      },
    },
  },

  plugins: [],
};
