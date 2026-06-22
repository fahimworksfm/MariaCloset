import { ImageResponse } from "next/og";
import { getItemById } from "@/lib/store";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Maria's Closet";

export default async function Image({ params }: { params: { id: string } }) {
  const item = await getItemById(params.id);
  const name = item?.name ?? "Maria's Closet";
  const price = item ? `$${item.pricePerDay} / day` : "Borrow something beautiful";
  const accent = item?.accent ?? "#FF9A1F";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "center",
          padding: 90,
          color: "#FFF4E6",
          backgroundImage: `linear-gradient(135deg, #1A0826 35%, ${accent})`,
        }}
      >
        <div style={{ fontSize: 30, letterSpacing: 10, color: "#FFC83D", display: "flex" }}>
          MARIA&apos;S CLOSET
        </div>
        <div style={{ fontSize: 92, fontWeight: 700, marginTop: 24, lineHeight: 1.05, display: "flex" }}>
          {name}
        </div>
        <div style={{ fontSize: 46, marginTop: 20, color: "#FFC83D", display: "flex" }}>{price}</div>
        <div style={{ fontSize: 30, marginTop: 40, opacity: 0.8, display: "flex" }}>
          {item?.category ?? "Rent the look"} · borrow something beautiful
        </div>
      </div>
    ),
    { ...size },
  );
}
