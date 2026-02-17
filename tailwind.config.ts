import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}"
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-text)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-serif"]
      },
      colors: {
        ivory: "rgb(var(--color-surface) / <alpha-value>)",
        charcoal: "rgb(var(--color-text) / <alpha-value>)",
        cedar: "rgb(var(--color-bg) / <alpha-value>)",
        rust: "rgb(var(--color-primary) / <alpha-value>)",
        teal: "rgb(var(--color-primary) / <alpha-value>)",
        mist: "rgb(var(--color-muted) / <alpha-value>)",
        sand: "rgb(var(--color-border) / <alpha-value>)"
      },
      boxShadow: {
        soft: "0 20px 50px -30px rgba(0, 0, 0, 0.6)"
      }
    }
  },
  plugins: []
};

export default config;
