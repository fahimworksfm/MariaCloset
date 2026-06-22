import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addGiftCard } from "@/lib/giftcards";

function makeCode(): string {
  return "MC-" + randomUUID().replace(/-/g, "").slice(0, 8).toUpperCase();
}

export async function POST(req: Request) {
  const { from, to, amount, message } = (await req.json().catch(() => ({}))) as {
    from?: string;
    to?: string;
    amount?: number;
    message?: string;
  };
  if (!from?.trim() || !to?.trim() || !(Number(amount) > 0)) {
    return NextResponse.json({ error: "Add who it's from, to, and an amount." }, { status: 400 });
  }
  const card = {
    id: randomUUID(),
    code: makeCode(),
    amount: Math.round(Number(amount)),
    from: String(from).slice(0, 80),
    to: String(to).slice(0, 80),
    message: message ? String(message).slice(0, 300) : undefined,
    createdAt: new Date().toISOString(),
  };
  const { stored } = await addGiftCard(card);
  return NextResponse.json({ ok: true, stored, card });
}
