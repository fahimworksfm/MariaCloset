import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { addOwner, closetTaken, getOwnerByEmail } from "@/lib/owners";
import { hashPassword } from "@/lib/password";
import { sendEmail, ownerEmail } from "@/lib/email";

export async function POST(req: Request) {
  const { closet, name, email, password, bio } = (await req.json().catch(() => ({}))) as Record<
    string,
    string
  >;
  if (!closet?.trim() || !name?.trim() || !email?.trim() || !password || password.length < 6) {
    return NextResponse.json(
      { error: "Fill in every field (password at least 6 characters)." },
      { status: 400 },
    );
  }
  if (await getOwnerByEmail(email)) {
    return NextResponse.json({ error: "That email already has a closet." }, { status: 409 });
  }
  if (await closetTaken(closet)) {
    return NextResponse.json({ error: "That closet name is taken — try another." }, { status: 409 });
  }

  const owner = {
    id: randomUUID(),
    closet: closet.trim().slice(0, 40),
    name: name.trim().slice(0, 80),
    email: email.trim().slice(0, 200),
    passwordHash: hashPassword(password),
    bio: bio ? String(bio).slice(0, 300) : undefined,
    status: "pending" as const,
    createdAt: new Date().toISOString(),
  };
  const { stored } = await addOwner(owner);

  const admin = ownerEmail();
  if (admin) {
    await sendEmail({
      to: admin,
      subject: `New closet application — ${owner.closet}`,
      html: `<p><b>${owner.name}</b> (${owner.email}) wants to open <b>${owner.closet}'s closet</b>.</p>${
        owner.bio ? `<p>${owner.bio}</p>` : ""
      }<p>Approve it in your admin → Owners.</p>`,
    });
  }
  return NextResponse.json({ ok: true, stored });
}
