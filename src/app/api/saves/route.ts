import { NextResponse } from "next/server";
import { getItemById } from "@/lib/store";
import { bumpSave } from "@/lib/saves";

/** Public, anonymous: a visitor hearted (saved: true) or un-hearted a piece. */
export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const itemId = typeof body?.itemId === "string" ? body.itemId.slice(0, 120) : "";
  if (!itemId || typeof body?.saved !== "boolean") {
    return NextResponse.json({ error: "Expected { itemId, saved }" }, { status: 400 });
  }
  // Only count real pieces, so the counts file can't fill with junk keys.
  if (!(await getItemById(itemId))) {
    return NextResponse.json({ error: "Unknown piece." }, { status: 404 });
  }
  const stored = await bumpSave(itemId, body.saved ? 1 : -1);
  return NextResponse.json({ ok: true, stored });
}
