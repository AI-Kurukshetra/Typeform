import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      fontFamily: {
        sans: ["var(--font-text)", "ui-sans-serif", "system-ui"],
        display: ["var(--font-display)", "ui-serif"]
      },
      colors: {
        ivory: "#f7f2ea",
        charcoal: "#11151a",
        cedar: "#6c3f2b",
        rust: "#c76438",
        teal: "#1b6f6a",
        mist: "#e6e1d7",
        sand: "#efe6da"
      },
      boxShadow: {
        soft: "0 20px 50px -30px rgba(17, 21, 26, 0.35)"
      }
    }
  },
  plugins: []
};

export default config;
