import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getWaitlist } from "@/lib/waitlist";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  return NextResponse.json({ waitlist: await getWaitlist() });
}
