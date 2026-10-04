import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getLookbook, saveLookbook } from "@/lib/lookbookStore";
import { sanitizeLook } from "@/lib/sanitizeLook";
import type { LookEntry } from "@/data/lookbook";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ entries: await getLookbook() });
}

export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const body = await req.json().catch(() => null);
  if (!body || !Array.isArray(body.entries)) {
    return NextResponse.json({ error: "Expected { entries: [...] }" }, { status: 400 });
  }
  const entries = body.entries.map(sanitizeLook).filter(Boolean) as LookEntry[];
  const { stored } = await saveLookbook(entries);
  return NextResponse.json({ ok: true, stored, count: entries.length });
}
