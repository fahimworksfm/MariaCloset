import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getItemById } from "@/lib/store";
import { saveRequest } from "@/lib/requests";
import { inclusiveDays, parseISO, rangeOverlapsUnavailable, formatPretty } from "@/lib/dates";
import { sendEmail, ownerEmail } from "@/lib/email";
import { money } from "@/data/config";
import { getReferralByCode, rewardsApplyTo } from "@/lib/rewards";
import { normContact } from "@/lib/requestMath";
import type { RentRequest } from "@/lib/types";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { itemId, renterName, contact, from, to, method, message, ref } = body as Record<
    string,
    string | undefined
  >;

  if (!itemId || !renterName || !contact || !from || !to) {
    return NextResponse.json(
      { error: "Please fill in your name, contact and rental dates." },
      { status: 400 },
    );
  }

  const item = await getItemById(itemId);
  if (!item) {
    return NextResponse.json({ error: "That piece no longer exists." }, { status: 404 });
  }

  const fromDate = parseISO(from);
  const toDate = parseISO(to);
  if (Number.isNaN(fromDate.getTime()) || Number.isNaN(toDate.getTime())) {
    return NextResponse.json({ error: "Those dates look invalid." }, { status: 400 });
  }
  if (toDate.getTime() < fromDate.getTime()) {
    return NextResponse.json(
      { error: "The return date can't be before the start date." },
      { status: 400 },
    );
  }
  if (rangeOverlapsUnavailable(fromDate, toDate, item.unavailable)) {
    return NextResponse.json(
      { error: "Some of those dates are already booked. Please pick another range." },
      { status: 409 },
    );
  }

  const days = inclusiveDays(fromDate, toDate);

  // Keep an invite code only if it's real, not your own, and this piece takes
  // part in rewards. Whether it's a first rental is checked at approval.
  let referral: { referralCode: string; referredBy: string } | undefined;
  if (ref && rewardsApplyTo(item)) {
    const r = await getReferralByCode(String(ref));
    if (r && r.contact !== normContact(String(contact))) {
      referral = { referralCode: r.code, referredBy: r.name };
    }
  }

  const record: RentRequest = {
    id: randomUUID(),
    itemId: item.id,
    itemName: item.name,
    renterName: String(renterName).slice(0, 120),
    contact: String(contact).slice(0, 200),
    from,
    to,
    days,
    total: days * item.pricePerDay,
    method: method ? String(method).slice(0, 60) : undefined,
    message: message ? String(message).slice(0, 1000) : undefined,
    ...referral,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const { stored } = await saveRequest(record);

  const owner = ownerEmail();
  if (owner) {
    await sendEmail({
      to: owner,
      subject: `New rental request — ${record.itemName}`,
      html: `<h2>New rental request</h2>
        <p><b>${record.itemName}</b> — ${formatPretty(record.from)} → ${formatPretty(
          record.to,
        )} (${record.days} day${record.days > 1 ? "s" : ""}, ${money(record.total)})</p>
        <p>From: ${record.renterName} (${record.contact})</p>
        ${record.method ? `<p>Receive by: ${record.method}</p>` : ""}
        ${record.message ? `<p>Note: ${record.message}</p>` : ""}
        <p>Review and approve it in your admin dashboard.</p>`,
    });
  }

  return NextResponse.json({
    ok: true,
    stored,
    request: {
      id: record.id,
      itemName: record.itemName,
      from: record.from,
      to: record.to,
      days: record.days,
      total: record.total,
    },
  });
}
