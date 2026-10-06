import { ImageResponse } from "next/og";
import { LOTUS_PATHS } from "@/components/Ornament";

// Browser-tab favicon: the bone lotus on a near-black rounded tile.
// 64px so it stays crisp on high-density screens. Prerendered at build.
export const size = { width: 64, height: 64 };
export const contentType = "image/png";

/** Square viewBox centred on the lotus (its paths sit high in the 24×24 box). */
const LOTUS_VIEWBOX = "2.5 0.35 19 19";

export default function Icon() {
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
          borderRadius: 14,
        }}
      >
        <svg width={46} height={46} viewBox={LOTUS_VIEWBOX} fill="#ECE7DD">
          {LOTUS_PATHS.map((p) => (
            <path key={p.d} d={p.d} opacity={p.opacity ?? 1} />
          ))}
        </svg>
      </div>
    ),
    { ...size },
  );
}
