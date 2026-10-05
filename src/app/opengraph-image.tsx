import { ImageResponse } from "next/og";
import { promises as fs } from "fs";
import path from "path";
import { siteConfig } from "@/data/config";

// Site-wide default share card. No params → prerendered at build time, so the
// photo is read straight from /public. Item pages override with their own.
export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = `${siteConfig.name} — ${siteConfig.tagline}`;

export default async function Image() {
  const photo = await fs.readFile(path.join(process.cwd(), "public", "brand", "og-silk.jpg"));
  const src = `data:image/jpeg;base64,${photo.toString("base64")}`;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", position: "relative", background: "#100F0D" }}>
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={src}
          alt=""
          width={1200}
          height={630}
          style={{ position: "absolute", top: 0, left: 0, width: 1200, height: 630, objectFit: "cover" }}
        />
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            width: 1200,
            height: 630,
            display: "flex",
            backgroundImage:
              "linear-gradient(180deg, rgba(16,15,13,0.1) 0%, rgba(16,15,13,0.5) 55%, rgba(16,15,13,0.92) 100%)",
          }}
        />
        <div
          style={{
            position: "absolute",
            left: 80,
            right: 80,
            bottom: 72,
            display: "flex",
            flexDirection: "column",
            color: "#ECE7DD",
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: 10, opacity: 0.65, display: "flex" }}>
            MARIA’S CLOSET
          </div>
          <div style={{ fontSize: 74, marginTop: 18, lineHeight: 1.05, display: "flex" }}>
            {siteConfig.tagline}
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
