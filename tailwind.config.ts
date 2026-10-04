import type { Config } from "tailwindcss";

const config: Config = {
  content: ["./src/**/*.{ts,tsx}"],
  theme: {
    extend: {
      colors: {
        // Monochrome luxe — warm near-black canvas, bone type, no colour in the
        // chrome. Token names are kept so existing classes retheme automatically;
        // former "accent" tokens now resolve to soft warm greys.
        night: "#100F0D", // page background (warm near-black)
        plum: "#15130F",
        aubergine: "#1A1713", // raised surfaces / panels
        ink: "#100F0D",
        cream: "#ECE7DD", // bone — primary text
        zari: "#F3EFE7", // bright bone — headings
        gold: "#B8B1A3", // soft warm grey — borders, secondary text, "accent"
        marigold: "#CFC8BA", // slightly brighter grey — eyebrows
        saffron: "#B8B1A3",
        rani: "#9C9589", // neutral grey (was wine)
        magenta: "#8C8579",
        peacock: "#8C8579",
        royal: "#8C8579",
        emerald: "#8E978A", // faint neutral for back-office "approved"
        vermilion: "#BE6A5E", // muted terracotta — errors only
      },
      fontFamily: {
        display: ["var(--font-display)", "Georgia", "serif"],
        sans: ["var(--font-sans)", "system-ui", "sans-serif"],
      },
      boxShadow: {
        glow: "0 18px 50px -24px rgba(0, 0, 0, 0.85)",
        "glow-pink": "0 18px 50px -24px rgba(0, 0, 0, 0.85)",
        gold: "0 0 0 1px rgba(236,231,221,0.14), 0 22px 60px -30px rgba(0,0,0,0.9)",
        panel: "0 24px 70px -30px rgba(0, 0, 0, 0.85)",
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
