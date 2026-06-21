import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getItems, saveItems } from "@/lib/store";
import type { Item } from "@/lib/types";

function sanitize(x: Record<string, unknown>): Item | null {
  if (!x || typeof x !== "object") return null;
  const id = String(x.id ?? "").trim();
  const name = String(x.name ?? "").trim();
  const image = String(x.image ?? "").trim();
  if (!id || !name || !image) return null;
  const accent = typeof x.accent === "string" && /^#[0-9a-fA-F]{3,8}$/.test(x.accent)
    ? x.accent
    : "#FF9A1F";
  return {
    id,
    name,
    category: String(x.category ?? "Piece"),
    brand: x.brand ? String(x.brand) : undefined,
    size: String(x.size ?? "One size"),
    color: String(x.color ?? ""),
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
    accent,
    unavailable: Array.isArray(x.unavailable)
      ? (x.unavailable as Array<{ from?: unknown; to?: unknown }>)
          .filter((r) => r && r.from && r.to)
          .map((r) => ({ from: String(r.from), to: String(r.to) }))
      : [],
  };
}

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ items: await getItems() });
}

export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "Expected { items: [...] }" }, { status: 400 });
  }
  const items = body.items.map(sanitize).filter(Boolean) as Item[];
  const { stored } = await saveItems(items);
  return NextResponse.json({ ok: true, stored, count: items.length });
}
