import type { Config } from "tailwindcss";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        mono: ["'JetBrains Mono'", "monospace"],
        display: ["'Hanken Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        headline: ["'Hanken Grotesk'", "sans-serif"],
      },
      colors: {
        bg: "#0a0a0f",
        surface: "#131313",
        "surface-container": "#20201f",
        "surface-container-low": "#1b1b1b",
        "surface-container-high": "#2a2a2a",
        "surface-container-highest": "#353535",
        "surface-elevated": "#212121",
        border: "#1e1e2e",
        "border-subtle": "#333333",
        accent: "#7c3aed",
        "accent-light": "#a78bfa",
        "accent-glow": "#7c3aed33",
        primary: "#b4c5ff",
        "primary-container": "#2563eb",
        "on-primary": "#002a78",
        "on-primary-container": "#eeefff",
        secondary: "#c6c6c6",
        "secondary-container": "#474747",
        tertiary: "#ffb596",
        "on-surface": "#e5e2e1",
        "on-surface-variant": "#c3c6d7",
        "text-muted": "#838383",
        muted: "#3f3f5e",
        text: "#e2e2f0",
        "text-muted-alt": "#8888aa",
      },
      animation: {
        "fade-in": "fadeIn 0.4s ease forwards",
        "slide-up": "slideUp 0.5s ease forwards",
        "pulse-slow": "pulse 3s infinite",
        shimmer: "shimmer 2s infinite",
      },
      keyframes: {
        fadeIn: {
          from: { opacity: "0" },
          to: { opacity: "1" },
        },
        slideUp: {
          from: { opacity: "0", transform: "translateY(16px)" },
          to: { opacity: "1", transform: "translateY(0)" },
        },
        shimmer: {
          "0%": { backgroundPosition: "-200% 0" },
          "100%": { backgroundPosition: "200% 0" },
        },
      },
    },
  },
  plugins: [],
};
export default config;
