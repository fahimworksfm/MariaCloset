import type { Item } from "@/lib/types";

export function sanitizeItem(x: Record<string, unknown>): Item | null {
  if (!x || typeof x !== "object") return null;
  const id = String(x.id ?? "").trim();
  const name = String(x.name ?? "").trim();
  const image = String(x.image ?? "").trim();
  if (!id || !name || !image) return null;
  const accent =
    typeof x.accent === "string" && /^#[0-9a-fA-F]{3,8}$/.test(x.accent) ? x.accent : "#A8536B";
  return {
    id,
    name,
    category: String(x.category ?? "Piece"),
    brand: x.brand ? String(x.brand) : undefined,
    size: String(x.size ?? "One size"),
    color: String(x.color ?? ""),
    occasions: Array.isArray(x.occasions)
      ? x.occasions.map(String).map((s) => s.trim()).filter(Boolean).slice(0, 8)
      : [],
    closet: x.closet ? String(x.closet).slice(0, 60) : undefined,
    pricePerDay: Math.max(0, Number(x.pricePerDay) || 0),
    retailValue:
      x.retailValue != null && x.retailValue !== ""
        ? Math.max(0, Number(x.retailValue) || 0)
        : undefined,
    description: String(x.description ?? ""),
    details: Array.isArray(x.details)
      ? x.details.map(String).filter(Boolean).slice(0, 8)
      : undefined,
    image,
    frames: Array.isArray(x.frames) ? x.frames.map(String).filter(Boolean) : undefined,
    fit: sanitizeFit(x.fit),
    accent,
    unavailable: Array.isArray(x.unavailable)
      ? (x.unavailable as Array<{ from?: unknown; to?: unknown }>)
          .filter((r) => r && r.from && r.to)
          .map((r) => ({ from: String(r.from), to: String(r.to) }))
      : [],
  };
}

function sanitizeFit(x: unknown): Item["fit"] | undefined {
  if (!x || typeof x !== "object") return undefined;
  const f = x as Record<string, unknown>;
  const num = (v: unknown) => (Number(v) > 0 ? Number(v) : undefined);
  const o = {
    bust: num(f.bust),
    waist: num(f.waist),
    length: num(f.length),
    note: f.note ? String(f.note).slice(0, 200) : undefined,
  };
  return o.bust || o.waist || o.length || o.note ? o : undefined;
}
