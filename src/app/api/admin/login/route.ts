import { NextResponse } from "next/server";
import { ADMIN_COOKIE, adminPassword } from "@/lib/auth";

export async function POST(req: Request) {
  const { password } = await req.json().catch(() => ({}) as { password?: string });
  if (!password || password !== adminPassword()) {
    return NextResponse.json({ error: "Wrong password." }, { status: 401 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(ADMIN_COOKIE, adminPassword(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
