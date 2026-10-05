import { ImageResponse } from "next/og";
import { headers } from "next/headers";
import { getItemById } from "@/lib/store";

export const runtime = "nodejs";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";
export const alt = "Maria's Closet";

/** Fetch the piece photo and inline it. Satori renders JPEG/PNG only, so any
 *  other format (or a failed fetch) falls back to a text-only card. */
async function loadPhoto(src: string): Promise<string | null> {
  try {
    const h = headers();
    const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
    const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
    const url = src.startsWith("http") ? src : `${proto}://${host}${src}`;
    const r = await fetch(url);
    if (!r.ok) return null;
    const type = r.headers.get("content-type") ?? "";
    if (!/^image\/(jpeg|png)/.test(type)) return null;
    const buf = Buffer.from(await r.arrayBuffer());
    return `data:${type};base64,${buf.toString("base64")}`;
  } catch {
    return null;
  }
}

export default async function Image({ params }: { params: { id: string } }) {
  const item = await getItemById(params.id);
  const name = item?.name ?? "Maria's Closet";
  const price = item ? `$${item.pricePerDay} / day` : "Borrow something beautiful";
  const photo = item?.image ? await loadPhoto(item.image) : null;

  return new ImageResponse(
    (
      <div style={{ width: "100%", height: "100%", display: "flex", background: "#100F0D" }}>
        {photo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={photo} alt="" width={470} height={630} style={{ width: 470, height: 630, objectFit: "cover" }} />
        )}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            padding: "0 80px",
            color: "#ECE7DD",
          }}
        >
          <div style={{ fontSize: 22, letterSpacing: 10, opacity: 0.55, display: "flex" }}>
            MARIA’S CLOSET
          </div>
          <div style={{ fontSize: 68, marginTop: 22, lineHeight: 1.06, display: "flex" }}>{name}</div>
          <div style={{ fontSize: 34, marginTop: 22, opacity: 0.75, display: "flex" }}>{price}</div>
          <div style={{ fontSize: 22, marginTop: 40, opacity: 0.45, display: "flex" }}>
            {item?.category ?? "Rent the look"} · borrow something beautiful
          </div>
        </div>
      </div>
    ),
    { ...size },
  );
}
