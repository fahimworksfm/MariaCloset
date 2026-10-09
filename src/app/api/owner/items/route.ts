import { NextResponse } from "next/server";
import { getCurrentOwner } from "@/lib/ownerAuth";
import { getItems, saveClosetItems } from "@/lib/store";
import { sanitizeItem } from "@/lib/sanitizeItem";
import type { Item } from "@/lib/types";

export async function GET() {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const items = (await getItems()).filter((i) => (i.closet || "") === owner.closet);
  return NextResponse.json({ items, closet: owner.closet });
}

export async function PUT(req: Request) {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.items)) {
    return NextResponse.json({ error: "Expected { items: [...] }" }, { status: 400 });
  }
  // The owner can only touch their own closet — force it on every piece.
  const mine = body.items.map(sanitizeItem).filter(Boolean) as Item[];
  const { stored } = await saveClosetItems(owner.closet, mine);
  return NextResponse.json({ ok: true, stored, count: mine.length });
}
