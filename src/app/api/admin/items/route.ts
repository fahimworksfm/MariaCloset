import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { getItems, saveItems } from "@/lib/store";
import { sanitizeItem } from "@/lib/sanitizeItem";
import type { Item } from "@/lib/types";

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
  const items = body.items.map(sanitizeItem).filter(Boolean) as Item[];
  const { stored } = await saveItems(items);
  // Prerendered pages show the Shop menu, which lists categories that have pieces.
  if (stored) revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, stored, count: items.length });
}
