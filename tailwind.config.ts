import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: "class",
  content: ["./src/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: {
    extend: {
      colors: {
        bg: "#141414",
        panel: "#1c1c1c",
        sidebar: "#0a0a16",
      },
    },
  },
  plugins: [],
};
export default config;
