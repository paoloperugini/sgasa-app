import type { Config } from "tailwindcss";
import plugin from "tailwindcss/plugin";

const config: Config = {
  darkMode: "class",
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        sgasa: {
          dark: "#090a0d",
          card: "#12141a",
          cardHover: "#181b23",
          border: "#20242f",
          borderLight: "#2c3242",
          orange: {
            DEFAULT: "#f97316",
            light: "#fb923c",
            dark: "#ea580c",
            glow: "rgba(249, 115, 22, 0.15)",
          },
        },
      },
      fontFamily: {
        sans: ["var(--font-geist-sans)", "Inter", "system-ui", "sans-serif"],
        mono: ["var(--font-geist-mono)", "monospace"],
      },
      boxShadow: {
        "orange-glow": "0 0 25px -5px rgba(249, 115, 22, 0.3)",
        "card-subtle": "0 1px 3px 0 rgba(0, 0, 0, 0.3), 0 1px 2px -1px rgba(0, 0, 0, 0.3)",
      },
    },
  },
  plugins: [
    plugin(function ({ addVariant }) {
      addVariant("light", [".light &", ":root:not(.dark) &"]);
    }),
  ],
};

export default config;
