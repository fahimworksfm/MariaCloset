import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getRequests } from "@/lib/requests";
import { decideRequest } from "@/lib/requestActions";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ requests: await getRequests() });
}

export async function PATCH(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const { id, status } = (await req.json().catch(() => ({}))) as {
    id?: string;
    status?: "approved" | "declined" | "pending";
  };
  if (!id || !status || !["approved", "declined", "pending"].includes(status)) {
    return NextResponse.json({ error: "Invalid id or status." }, { status: 400 });
  }
  const updated = await decideRequest(id, status);
  if (!updated) return NextResponse.json({ error: "Request not found." }, { status: 404 });
  return NextResponse.json({ ok: true, request: updated });
}
