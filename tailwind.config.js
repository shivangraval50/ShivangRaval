/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class',
  content: [
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./data/**/*.{js,ts,jsx,tsx,mdx}",
    "./lib/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        void: {
          DEFAULT: "#05070a",
          surface: "#0c1017",
          elevated: "#121926",
          card: "#0e131b",
        },
        line: {
          subtle: "#1a212c",
          strong: "#2a3444",
        },
        ink: {
          primary: "#eef2f6",
          secondary: "#98a7b5",
          tertiary: "#5c6b7a",
        },
        signal: {
          cyan: "#2dd4f0",
          blue: "#3b82f6",
          amber: "#f0b429",
          orange: "#fb923c",
          green: "#3ddc84",
          emerald: "#10b981",
          violet: "#a78bfa",
          fuchsia: "#e879f9",
          rose: "#fb7185",
          pink: "#f472b6",
          red: "#ff5d5d",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, transparent, rgba(5,7,10,0.6) 70%, #05070a 100%)",
      },
      animation: {
        blink: "blink 1.1s step-end infinite",
        marquee: "marquee 32s linear infinite",
        "pulse-slow": "pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite",
      },
      keyframes: {
        blink: {
          "0%, 100%": { opacity: "1" },
          "50%": { opacity: "0" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
