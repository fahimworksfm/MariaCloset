import type { Metadata, Viewport } from "next";
import { Cormorant_Garamond, Inter } from "next/font/google";
import { siteConfig } from "@/data/config";
import InviteCapture from "@/components/InviteCapture";
import Stylist from "@/components/Stylist";
import "./globals.css";

const display = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600"],
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
};

// Tints the mobile browser chrome to match the near-black canvas.
export const viewport: Viewport = { themeColor: "#100F0D" };

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable}`}>
      <body className="bg-festive min-h-screen antialiased">
        <InviteCapture />
        {children}
        <Stylist />
      </body>
    </html>
  );
}
