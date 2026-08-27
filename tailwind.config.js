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
          fill: "hsl(var(--brand-fill) / <alpha-value>)",
          onfill: "hsl(var(--brand-on-fill) / <alpha-value>)",
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
        sans: ["var(--font-sans)", "-apple-system", "BlinkMacSystemFont", "system-ui", "sans-serif"],
        mono: ["var(--font-mono)", "ui-monospace", "SFMono-Regular", "monospace"],
      },
      // Apple's display type is tightly tracked; body copy slightly so.
      letterSpacing: {
        display: "-0.024em",
        title: "-0.018em",
        body: "-0.011em",
        label: "0.01em",
      },
      borderRadius: {
        // Apple's continuous-corner language: generous, consistent radii.
        card: "1.125rem",
        sheet: "1.375rem",
        control: "0.75rem",
      },
      boxShadow: {
        e1: "var(--shadow-1)",
        e2: "var(--shadow-2)",
        sheet: "var(--shadow-sheet)",
      },
      transitionTimingFunction: {
        // The curve the system uses for sheets and most view transitions.
        apple: "cubic-bezier(0.32, 0.72, 0, 1)",
      },
      animation: {
        marquee: "marquee 60s linear infinite",
      },
      keyframes: {
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
    },
  },
  plugins: [],
};
