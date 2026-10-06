import { ImageResponse } from "next/og";
import { LOTUS_PATHS } from "@/components/Ornament";

// iPhone home-screen icon. Full-bleed square — iOS applies its own rounding.
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default function AppleIcon() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#100F0D",
        }}
      >
        <svg width={112} height={112} viewBox="2.5 0.35 19 19" fill="#ECE7DD">
          {LOTUS_PATHS.map((p) => (
            <path key={p.d} d={p.d} opacity={p.opacity ?? 1} />
          ))}
        </svg>
      </div>
    ),
    { ...size },
  );
}
