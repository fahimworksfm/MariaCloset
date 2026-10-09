import { NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { isAdmin } from "@/lib/auth";
import { getSettings, sanitizeSettings, saveSettings } from "@/lib/settings";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ settings: await getSettings() });
}

export async function PUT(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const settings = sanitizeSettings(await req.json().catch(() => null));
  if (!settings) return NextResponse.json({ error: "Check the owner email address." }, { status: 400 });
  const { stored } = await saveSettings(settings);
  // Tagline/description feed every page's metadata — refresh any cached pages.
  if (stored) revalidatePath("/", "layout");
  return NextResponse.json({ ok: true, stored, settings });
}
