import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // deep, restrained base
        night: "#160A12",
        plum: "#1E0E1A",
        aubergine: "#2A1422",
        // muted, classy accents (was neon — toned down)
        rani: "#A8536B", // muted rose-wine
        magenta: "#8E3A57",
        marigold: "#C99A52", // muted amber
        saffron: "#B5763A",
        vermilion: "#B0463E", // muted, for errors
        peacock: "#3E8C82", // muted teal
        emerald: "#3E8C6A",
        royal: "#5A4A86",
        gold: "#C9A24B",
        zari: "#D9C28A", // champagne
        cream: "#F2E9DC",
        ink: "#160A12",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 14px 40px -18px rgba(201, 162, 75, 0.4)",
        "glow-pink": "0 14px 40px -18px rgba(168, 83, 107, 0.4)",
        gold: "0 0 0 1px rgba(201,162,75,0.35), 0 18px 50px -22px rgba(0,0,0,0.75)",
        panel: "0 24px 70px -28px rgba(0, 0, 0, 0.8)",
      },
      keyframes: {
        "fade-up": {
          "0%": { opacity: "0", transform: "translateY(16px)" },
          "100%": { opacity: "1", transform: "translateY(0)" },
        },
        float: {
          "0%, 100%": { transform: "translateY(0)" },
          "50%": { transform: "translateY(-8px)" },
        },
        "spin-slow": {
          "0%": { transform: "rotate(0deg)" },
          "100%": { transform: "rotate(360deg)" },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 120s linear infinite",
        marquee: "marquee 42s linear infinite",
      },
    },
  },
  plugins: [],
};

export default config;
