import { NextResponse } from "next/server";
import { getCurrentOwner } from "@/lib/ownerAuth";
import { getLookbookFor, saveLookbookFor } from "@/lib/lookbookStore";
import { sanitizeLook } from "@/lib/sanitizeLook";
import type { LookEntry } from "@/data/lookbook";

export async function GET() {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ entries: await getLookbookFor(owner.closet), closet: owner.closet });
}

export async function PUT(req: Request) {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.entries)) {
    return NextResponse.json({ error: "Expected { entries: [...] }" }, { status: 400 });
  }
  // The owner can only touch their own closet — saveLookbookFor forces it.
  const entries = body.entries.map(sanitizeLook).filter(Boolean) as LookEntry[];
  const { stored } = await saveLookbookFor(owner.closet, entries);
  return NextResponse.json({ ok: true, stored, count: entries.length });
}
