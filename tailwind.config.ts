import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // deep festive night
        night: "#1A0826",
        plum: "#2C0A2E",
        aubergine: "#3D0E33",
        // vibrant rickshaw-art palette
        rani: "#FF2E88", // rani pink
        magenta: "#D81E7A",
        marigold: "#FF9A1F", // gende phool
        saffron: "#FF6A13",
        vermilion: "#F0322B",
        peacock: "#12C2B4", // bright moyur teal
        emerald: "#13A66A",
        royal: "#6A2BD9", // royal purple
        gold: "#FFC83D",
        zari: "#F2B53C",
        cream: "#FFF4E6",
        ink: "#240A1E",
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 0 40px -6px rgba(255, 154, 31, 0.55)",
        "glow-pink": "0 0 44px -6px rgba(255, 46, 136, 0.5)",
        gold: "0 0 0 1px rgba(255,200,61,0.5), 0 18px 50px -16px rgba(0,0,0,0.7)",
        panel: "0 24px 70px -24px rgba(0, 0, 0, 0.8)",
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
        shimmer: {
          "0%": { backgroundPosition: "200% center" },
          "100%": { backgroundPosition: "-200% center" },
        },
        "gradient-pan": {
          "0%, 100%": { backgroundPosition: "0% 50%" },
          "50%": { backgroundPosition: "100% 50%" },
        },
        "glow-pulse": {
          "0%, 100%": { opacity: "0.55", transform: "scale(1)" },
          "50%": { opacity: "1", transform: "scale(1.06)" },
        },
        sway: {
          "0%, 100%": { transform: "rotate(-1.5deg)" },
          "50%": { transform: "rotate(1.5deg)" },
        },
        "petal-fall": {
          "0%": { transform: "translateY(-12vh) translateX(0) rotate(0deg)", opacity: "0" },
          "8%": { opacity: "0.9" },
          "92%": { opacity: "0.9" },
          "100%": {
            transform: "translateY(112vh) translateX(60px) rotate(420deg)",
            opacity: "0",
          },
        },
        marquee: {
          "0%": { transform: "translateX(0)" },
          "100%": { transform: "translateX(-50%)" },
        },
        twinkle: {
          "0%, 100%": { opacity: "0.3", transform: "scale(0.85)" },
          "50%": { opacity: "1", transform: "scale(1.1)" },
        },
      },
      animation: {
        "fade-up": "fade-up 0.8s cubic-bezier(0.22,1,0.36,1) both",
        float: "float 6s ease-in-out infinite",
        "spin-slow": "spin-slow 90s linear infinite",
        shimmer: "shimmer 6s linear infinite",
        "gradient-pan": "gradient-pan 14s ease infinite",
        "glow-pulse": "glow-pulse 4s ease-in-out infinite",
        sway: "sway 5s ease-in-out infinite",
        marquee: "marquee 30s linear infinite",
        twinkle: "twinkle 3s ease-in-out infinite",
      },
    },
  },
  plugins: [],
};

export default config;
