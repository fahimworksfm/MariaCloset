import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getItemById } from "@/lib/store";
import { addWaitlist } from "@/lib/waitlist";

export async function POST(req: Request) {
  const { itemId, contact } = (await req.json().catch(() => ({}))) as {
    itemId?: string;
    contact?: string;
  };
  if (!itemId || !contact?.trim()) {
    return NextResponse.json({ error: "Please add your email or phone." }, { status: 400 });
  }
  const item = await getItemById(itemId);
  if (!item) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  const { stored } = await addWaitlist({
    id: randomUUID(),
    itemId: item.id,
    itemName: item.name,
    contact: String(contact).slice(0, 200),
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true, stored });
}
