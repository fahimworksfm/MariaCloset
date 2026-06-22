import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getOwners, setOwnerStatus } from "@/lib/owners";
import { sendEmail } from "@/lib/email";

export async function GET() {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  const owners = (await getOwners()).map((o) => ({
    id: o.id,
    closet: o.closet,
    name: o.name,
    email: o.email,
    bio: o.bio,
    status: o.status,
    createdAt: o.createdAt,
  }));
  return NextResponse.json({ owners });
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
  const owner = await setOwnerStatus(id, status);
  if (!owner) return NextResponse.json({ error: "Not found." }, { status: 404 });

  if (status === "approved") {
    await sendEmail({
      to: owner.email,
      subject: `${owner.closet}'s closet is live! 🎉`,
      html: `<p>Hi ${owner.name}, your closet was approved. Log in at <b>/owner/login</b> to add your pieces — they'll appear in Maria's Closet.</p>`,
    });
  }
  return NextResponse.json({ ok: true });
}
