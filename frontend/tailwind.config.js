/** @type {import('tailwindcss').Config} */
export default {
  content: ["./index.html", "./src/**/*.{js,jsx}"],
  theme: {
    extend: {
      colors: {
        void: "#0A0E17",
        panel: "#0E1420",
        "panel-raised": "#121A28",
        grid: "rgba(148,197,255,0.055)",
        line: "#223047",
        "line-bright": "#33465F",
        ink: "#E7EEF7",
        muted: "#7C8CA5",
        cyan: {
          DEFAULT: "#4CE0D2",
          dim: "#2A8F86",
          glow: "rgba(76,224,210,0.35)",
        },
        amber: {
          DEFAULT: "#F5A623",
          dim: "#8A6216",
        },
        danger: "#FF6B6B",
      },
      fontFamily: {
        display: ["'Space Grotesk'", "sans-serif"],
        body: ["'Inter'", "sans-serif"],
        mono: ["'JetBrains Mono'", "monospace"],
      },
      backgroundImage: {
        blueprint:
          "linear-gradient(rgba(148,197,255,0.055) 1px, transparent 1px), linear-gradient(90deg, rgba(148,197,255,0.055) 1px, transparent 1px)",
      },
      backgroundSize: {
        grid: "28px 28px",
      },
      boxShadow: {
        glow: "0 0 0 1px rgba(76,224,210,0.4), 0 0 24px rgba(76,224,210,0.12)",
      },
    },
  },
  plugins: [],
};
