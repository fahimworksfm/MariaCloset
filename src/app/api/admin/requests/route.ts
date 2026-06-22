import { NextResponse } from "next/server";
import { isAdmin } from "@/lib/auth";
import { getRequests, updateRequestStatus } from "@/lib/requests";
import { getItems, saveItems } from "@/lib/store";
import { sendEmail, looksLikeEmail } from "@/lib/email";
import { formatPretty } from "@/lib/dates";
import { money, siteConfig } from "@/data/config";

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

  const updated = await updateRequestStatus(id, status);
  if (!updated) return NextResponse.json({ error: "Request not found." }, { status: 404 });

  // On approve, block those dates on the item so it can't be double-booked.
  if (status === "approved") {
    const items = await getItems();
    const item = items.find((i) => i.id === updated.itemId);
    if (item) {
      const exists = (item.unavailable ?? []).some(
        (r) => r.from === updated.from && r.to === updated.to,
      );
      if (!exists) {
        item.unavailable = [...(item.unavailable ?? []), { from: updated.from, to: updated.to }];
        await saveItems(items);
      }
    }
  }

  // Notify the renter if we have an email.
  if ((status === "approved" || status === "declined") && looksLikeEmail(updated.contact)) {
    const ok = status === "approved";
    await sendEmail({
      to: updated.contact.trim(),
      subject: ok
        ? `Your rental is confirmed — ${updated.itemName}`
        : `Update on your rental request — ${updated.itemName}`,
      html: ok
        ? `<h2>You're confirmed! 🎉</h2>
           <p>${siteConfig.ownerName} approved your rental of <b>${updated.itemName}</b> from
           ${formatPretty(updated.from)} to ${formatPretty(updated.to)}
           (${updated.days} day${updated.days > 1 ? "s" : ""}, ${money(updated.total)}).</p>
           <p>Please handle it with love — away from food, perfume and flames — and return it as
           received. ${siteConfig.ownerName} will be in touch about pickup & return.</p>`
        : `<p>Thank you for your interest in <b>${updated.itemName}</b>. Those dates didn't work
           out this time — please pick other dates or browse more pieces. 💛</p>`,
    });
  }

  return NextResponse.json({ ok: true, request: updated });
}
