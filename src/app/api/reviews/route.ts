import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getItemById } from "@/lib/store";
import { addReview } from "@/lib/reviews";

export async function POST(req: Request) {
  const { itemId, name, rating, text } = (await req.json().catch(() => ({}))) as {
    itemId?: string;
    name?: string;
    rating?: number;
    text?: string;
  };
  if (!itemId || !name?.trim() || !text?.trim()) {
    return NextResponse.json({ error: "Please add your name and a review." }, { status: 400 });
  }
  const item = await getItemById(itemId);
  if (!item) return NextResponse.json({ error: "Item not found." }, { status: 404 });

  const { stored } = await addReview({
    id: randomUUID(),
    itemId: item.id,
    name: String(name).slice(0, 80),
    rating: Math.min(5, Math.max(1, Math.round(Number(rating) || 5))),
    text: String(text).slice(0, 600),
    approved: false,
    createdAt: new Date().toISOString(),
  });
  return NextResponse.json({ ok: true, stored });
}
