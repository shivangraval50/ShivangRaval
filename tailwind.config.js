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
          DEFAULT: "hsl(var(--bg-base) / <alpha-value>)",
          surface: "hsl(var(--bg-surface) / <alpha-value>)",
          elevated: "hsl(var(--bg-elevated) / <alpha-value>)",
          card: "hsl(var(--bg-card) / <alpha-value>)",
        },
        line: {
          subtle: "hsl(var(--line-subtle) / <alpha-value>)",
          strong: "hsl(var(--line-strong) / <alpha-value>)",
        },
        ink: {
          primary: "hsl(var(--fg-primary) / <alpha-value>)",
          secondary: "hsl(var(--fg-secondary) / <alpha-value>)",
          tertiary: "hsl(var(--fg-tertiary) / <alpha-value>)",
        },
        brand: {
          primary: "hsl(var(--brand-primary) / <alpha-value>)",
          accent: "hsl(var(--brand-accent) / <alpha-value>)",
        },
        signal: {
          cyan: "hsl(var(--signal-cyan) / <alpha-value>)",
          blue: "hsl(var(--signal-blue) / <alpha-value>)",
          amber: "hsl(var(--signal-amber) / <alpha-value>)",
          orange: "hsl(var(--signal-orange) / <alpha-value>)",
          green: "hsl(var(--signal-green) / <alpha-value>)",
          emerald: "hsl(var(--signal-emerald) / <alpha-value>)",
          violet: "hsl(var(--signal-violet) / <alpha-value>)",
          fuchsia: "hsl(var(--signal-fuchsia) / <alpha-value>)",
          rose: "hsl(var(--signal-rose) / <alpha-value>)",
          pink: "hsl(var(--signal-pink) / <alpha-value>)",
          red: "hsl(var(--signal-red) / <alpha-value>)",
        },
      },
      fontFamily: {
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      backgroundImage: {
        "grid-fade":
          "linear-gradient(to bottom, transparent, hsl(var(--bg-base) / 0.6) 70%, hsl(var(--bg-base)) 100%)",
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
