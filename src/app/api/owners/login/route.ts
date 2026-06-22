import { NextResponse } from "next/server";
import { getOwnerByEmail } from "@/lib/owners";
import { verifyPassword } from "@/lib/password";
import { OWNER_COOKIE, ownerCookieValue } from "@/lib/ownerAuth";

export async function POST(req: Request) {
  const { email, password } = (await req.json().catch(() => ({}))) as Record<string, string>;
  if (!email || !password) {
    return NextResponse.json({ error: "Enter your email and password." }, { status: 400 });
  }
  const owner = await getOwnerByEmail(email);
  if (!owner || !verifyPassword(password, owner.passwordHash)) {
    return NextResponse.json({ error: "Wrong email or password." }, { status: 401 });
  }
  if (owner.status === "pending") {
    return NextResponse.json({ error: "Your closet is still awaiting approval." }, { status: 403 });
  }
  if (owner.status === "declined") {
    return NextResponse.json({ error: "This application wasn't approved." }, { status: 403 });
  }
  const res = NextResponse.json({ ok: true });
  res.cookies.set(OWNER_COOKIE, ownerCookieValue(owner.id), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30,
  });
  return res;
}
