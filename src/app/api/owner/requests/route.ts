import { NextResponse } from "next/server";
import { getCurrentOwner } from "@/lib/ownerAuth";
import { getItems, getItemById } from "@/lib/store";
import { getRequests } from "@/lib/requests";
import { decideRequest } from "@/lib/requestActions";

async function ownerItemIds(closet: string): Promise<Set<string>> {
  return new Set((await getItems()).filter((i) => (i.closet || "") === closet).map((i) => i.id));
}

export async function GET() {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const ids = await ownerItemIds(owner.closet);
  const requests = (await getRequests()).filter((r) => ids.has(r.itemId));
  return NextResponse.json({ requests });
}

export async function PATCH(req: Request) {
  const owner = await getCurrentOwner();
  if (!owner) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, status } = (await req.json().catch(() => ({}))) as {
    id?: string;
    status?: "approved" | "declined" | "pending";
  };
  if (!id || !status || !["approved", "declined", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid id or status." }, { status: 400 });
  }
  const target = (await getRequests()).find((r) => r.id === id);
  if (!target) return NextResponse.json({ error: "Not found." }, { status: 404 });
  const item = await getItemById(target.itemId);
  if (!item || (item.closet || "") !== owner.closet) {
    return NextResponse.json({ error: "Not your piece." }, { status: 403 });
  }
  const updated = await decideRequest(id, status);
  return NextResponse.json({ ok: true, request: updated });
}
