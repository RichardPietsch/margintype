import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        background: "#f4f4f3",
        paper: "#ffffff",
        ink: "#161616",
        muted: "#6f6f6f"
      },
      fontFamily: {
        sans: ["Inter", "system-ui", "sans-serif"],
        serif: ["Georgia", "Times New Roman", "serif"]
      },
      boxShadow: {
        paper: "0 1px 0 rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.03)"
      }
    }
  },
  plugins: []
};

export default config;
