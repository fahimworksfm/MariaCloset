import { NextResponse } from "next/server";
import { ensureReferralCode, getReferralByCode } from "@/lib/rewards";
import { getSettings } from "@/lib/settings";

/** Get (or create) your invite code. Returns only the code — never balances. */
export async function POST(req: Request) {
  if (!(await getSettings()).rewards.enabled) return NextResponse.json({ error: "Rewards are off." }, { status: 404 });
  const body = await req.json().catch(() => null);
  const name = String(body?.name ?? "").trim().slice(0, 60);
  const contact = String(body?.contact ?? "").trim().slice(0, 120);
  if (!name || contact.length < 5) {
    return NextResponse.json({ error: "Add your name and an email or phone." }, { status: 400 });
  }
  const ref = await ensureReferralCode(name, contact);
  return NextResponse.json({ code: ref.code });
}

/** Who sent this invite? First name only — it's shown to the friend. */
export async function GET(req: Request) {
  const code = new URL(req.url).searchParams.get("code") ?? "";
  const ref = code ? await getReferralByCode(code) : undefined;
  if (!ref) return NextResponse.json({ error: "Unknown code." }, { status: 404 });
  return NextResponse.json({ name: ref.name });
}
