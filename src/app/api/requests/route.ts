import { NextResponse } from "next/server";
import { randomUUID } from "crypto";
import { getItemById } from "@/lib/store";
import { saveRequest } from "@/lib/requests";
import { inclusiveDays, parseISO, rangeOverlapsUnavailable } from "@/lib/dates";
import type { RentRequest } from "@/lib/types";

export async function POST(request: Request) {
  let body: Record<string, unknown>;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const { itemId, renterName, contact, from, to, message } = body as Record<
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
    message: message ? String(message).slice(0, 1000) : undefined,
    status: "pending",
    createdAt: new Date().toISOString(),
  };

  const { stored } = await saveRequest(record);

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
