import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getReviews, setApproved, removeReview } from "@/lib/reviews";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ reviews: await getReviews() });
}

export async function PATCH(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, approved } = (await req.json().catch(() => ({}))) as {
    id?: string;
    approved?: boolean;
  };
  if (!id || typeof approved !== "boolean") {
    return NextResponse.json({ error: "Expected { id, approved }" }, { status: 400 });
  }
  const updated = await setApproved(id, approved);
  if (!updated) return NextResponse.json({ error: "Not found." }, { status: 404 });
  return NextResponse.json({ ok: true, review: updated });
}

export async function DELETE(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "Missing id" }, { status: 400 });
  const ok = await removeReview(id);
  return NextResponse.json({ ok });
}
