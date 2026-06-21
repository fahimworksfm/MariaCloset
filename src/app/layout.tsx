import type { Metadata } from "next";
import { Rozha_One, Inter, Baloo_Da_2 } from "next/font/google";
import { siteConfig } from "@/data/config";
import "./globals.css";

const display = Rozha_One({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-display",
  display: "swap",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

const bengali = Baloo_Da_2({
  subsets: ["bengali"],
  weight: ["500", "600", "700"],
  variable: "--font-bengali",
  display: "swap",
});

export const metadata: Metadata = {
  title: `${siteConfig.name} — ${siteConfig.tagline}`,
  description: siteConfig.description,
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${display.variable} ${sans.variable} ${bengali.variable}`}>
      <body className="bg-festive min-h-screen antialiased">
        <div className="bg-jali min-h-screen">{children}</div>
      </body>
    </html>
  );
}
