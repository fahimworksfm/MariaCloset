import { updateRequestStatus } from "@/lib/requests";
import { getItems, saveItems } from "@/lib/store";
import { sendEmail, looksLikeEmail } from "@/lib/email";
import { formatPretty } from "@/lib/dates";
import { money, siteConfig } from "@/data/config";
import type { RentRequest } from "@/lib/types";

/** Update a request's status, block the dates on approve, and email the renter.
 *  Shared by the super-admin and owner-scoped routes. */
export async function decideRequest(
  id: string,
  status: RentRequest["status"],
): Promise<RentRequest | null> {
  const updated = await updateRequestStatus(id, status);
  if (!updated) return null;

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

  if ((status === "approved" || status === "declined") && looksLikeEmail(updated.contact)) {
    const ok = status === "approved";
    await sendEmail({
      to: updated.contact.trim(),
      subject: ok
        ? `Your rental is confirmed — ${updated.itemName}`
        : `Update on your rental request — ${updated.itemName}`,
      html: ok
        ? `<h2>You're confirmed! 🎉</h2>
           <p>Your rental of <b>${updated.itemName}</b> from ${formatPretty(updated.from)} to
           ${formatPretty(updated.to)} (${updated.days} day${updated.days > 1 ? "s" : ""},
           ${money(updated.total)}) is approved.</p>
           <p>Please handle it with love and return it as received. We'll be in touch about pickup.</p>`
        : `<p>Thank you for your interest in <b>${updated.itemName}</b>. Those dates didn't work
           out this time — please pick other dates or browse more pieces. 💛 — ${siteConfig.name}</p>`,
    });
  }
  return updated;
}
