import { NextResponse } from "next/server";
import { getCurrentOwner } from "@/lib/ownerAuth";
import { getItems, getItemById } from "@/lib/store";
import { getReviews, setApproved, removeReview } from "@/lib/reviews";

async function ownerItemIds(closet: string): Promise<Set<string>> {
  return new Set((await getItems()).filter((i) => (i.closet || "") === closet).map((i) => i.id));
}

async function ownsReview(closet: string, reviewId: string): Promise<boolean> {
  const review = (await getReviews()).find((r) => r.id === reviewId);
  if (!review) return false;
  const item = await getItemById(review.itemId);
  return !!item && (item.closet || "") === closet;
}

export async function GET() {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ids = await ownerItemIds(owner.closet);
  const reviews = (await getReviews()).filter((r) => ids.has(r.itemId));
  return NextResponse.json({ reviews });
}

export async function PATCH(req: Request) {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, approved } = (await req.json().catch(() => ({}))) as {
    id?: string;
    approved?: boolean;
  };
  if (!id || typeof approved !== "boolean") {
    return NextResponse.json({ error: "Expected { id, approved }" }, { status: 400 });
  }
  if (!(await ownsReview(owner.closet, id))) {
    return NextResponse.json({ error: "Not your piece." }, { status: 403 });
  }
  const updated = await setApproved(id, approved);
  return NextResponse.json({ ok: true, review: updated });
}

export async function DELETE(req: Request) {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  if (!(await ownsReview(owner.closet, id))) {
    return NextResponse.json({ error: "Not your piece." }, { status: 403 });
  }
  return NextResponse.json({ ok: await removeReview(id) });
}
