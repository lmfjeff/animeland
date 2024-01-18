import type { Config } from "tailwindcss"

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      backgroundImage: {
        "gradient-radial": "radial-gradient(var(--tw-gradient-stops))",
        "gradient-conic": "conic-gradient(from 180deg at 50% 50%, var(--tw-gradient-stops))",
      },
      zIndex: {
        dropdown: "1000",
        sticky: "1010",
        fixed: "1020",
        backdrop: "1030",
        modal: "1040",
        popover: "1050",
        toast: "1060",
        tooltip: "1070",
      },
    },
  },
  plugins: [],
}
export default config
