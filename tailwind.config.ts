import type { Config } from "tailwindcss";

export default {
  content: ["./app/**/*.{ts,tsx}", "./components/**/*.{ts,tsx}", "./lib/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        navy: { 950: "#050b1f", 900: "#08142f", 800: "#0d2048" },
        electric: "#1f8fff",
        gold: "#f8c95d"
      },
      boxShadow: { glow: "0 0 50px rgba(31,143,255,.25)" }
    }
  },
  plugins: []
} satisfies Config;
