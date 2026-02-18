/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ["./src/**/*.{js,jsx,ts,tsx}"],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: "var(--color-primary)",
          light: "var(--color-primary-light)",
          dark: "var(--color-primary-dark)",
        },
        accent: {
          DEFAULT: "var(--color-accent)",
          light: "var(--color-accent-light)",
          dark: "var(--color-accent-dark)",
        },
        deep: {
          DEFAULT: "var(--color-deep)",
          light: "var(--color-deep-light)",
          dark: "var(--color-deep-dark)",
        },
        surface: {
          DEFAULT: "var(--color-surface)",
          alt: "var(--color-surface-alt)",
        },
        background: "var(--color-background)",
        highlight: {
          DEFAULT: "var(--color-highlight)",
          light: "var(--color-highlight-light)",
        },
        text: {
          DEFAULT: "var(--color-text)",
          muted: "var(--color-text-muted)",
          ondark: "var(--color-text-on-dark)",
        },
      },
    },
  },
  plugins: [],
};
