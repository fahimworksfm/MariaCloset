import { getRequests, patchRequest, updateRequestStatus } from "@/lib/requests";
import { getItems, saveItems } from "@/lib/store";
import { sendEmail, looksLikeEmail } from "@/lib/email";
import { formatPretty } from "@/lib/dates";
import { money, rewardsConfig, siteConfig } from "@/data/config";
import { netTotal } from "@/lib/requestMath";
import {
  ensureReferralCode,
  getCredits,
  getReferrals,
  planRewards,
  recordLedger,
  rewardsApplyTo,
} from "@/lib/rewards";
import type { RentRequest } from "@/lib/types";

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Update a request's status, block the dates and settle rewards on approve,
 *  and email the renter. Shared by the super-admin and owner-scoped routes. */
export async function decideRequest(
  id: string,
  status: RentRequest["status"],
): Promise<RentRequest | null> {
  let updated = await updateRequestStatus(id, status);
  if (!updated) return null;

  if (status === "approved") {
    const items = await getItems();
    const item = items.find((i) => i.id === updated!.itemId);
    if (item) {
      const exists = (item.unavailable ?? []).some(
        (r) => r.from === updated!.from && r.to === updated!.to,
      );
      if (!exists) {
        item.unavailable = [...(item.unavailable ?? []), { from: updated.from, to: updated.to }];
        await saveItems(items);
      }
    }

    // Rewards settle exactly once: `adjustments` is written (even if empty) the
    // first time a request is approved, so re-approving can't double-credit.
    if (updated.adjustments === undefined) {
      const [all, referrals, credits] = await Promise.all([getRequests(), getReferrals(), getCredits()]);
      const plan = planRewards(updated, item, all, referrals, credits);
      await recordLedger(plan.ledger);
      updated = (await patchRequest(id, { adjustments: plan.adjustments })) ?? updated;
    }
  }

  if ((status === "approved" || status === "declined") && looksLikeEmail(updated.contact)) {
    await sendEmail({
      to: updated.contact.trim(),
      subject:
        status === "approved"
          ? `Your rental is confirmed — ${updated.itemName}`
          : `Update on your rental request — ${updated.itemName}`,
      html: status === "approved" ? await approvedEmail(updated) : declinedEmail(updated),
    });
  }
  return updated;
}

async function approvedEmail(r: RentRequest): Promise<string> {
  const items = await getItems();
  const adj = r.adjustments ?? [];
  const priceLines = adj.length
    ? `<ul>${adj.map((a) => `<li>${esc(a.label)}: −${money(a.amount)}</li>`).join("")}</ul>
       <p><b>You pay ${money(netTotal(r))}</b> (was ${money(r.total)}).</p>`
    : `<p>Total: <b>${money(r.total)}</b>.</p>`;

  // Every confirmed renter gets their own invite link.
  let invite = "";
  if (rewardsConfig.enabled && rewardsApplyTo(items.find((i) => i.id === r.itemId))) {
    const ref = await ensureReferralCode(r.renterName, r.contact);
    const link = `${siteConfig.url}/?ref=${ref.code}`;
    invite = `<p>Know someone who'd love this? Share your link — they get ${money(
      rewardsConfig.welcomeOffer,
    )} off their first rental and you get ${money(rewardsConfig.referralReward)} credit:<br>
      <a href="${link}">${link}</a></p>`;
  }

  return `<h2>You're confirmed!</h2>
    <p>Your rental of <b>${esc(r.itemName)}</b> from ${formatPretty(r.from)} to ${formatPretty(r.to)}
    (${r.days} day${r.days > 1 ? "s" : ""}) is approved.</p>
    ${priceLines}
    <p>Please handle it with love and return it as received. We'll be in touch about pickup.</p>
    ${invite}`;
}

function declinedEmail(r: RentRequest): string {
  return `<p>Thank you for your interest in <b>${esc(r.itemName)}</b>. Those dates didn't work
    out this time — please pick other dates or browse more pieces. — ${siteConfig.name}</p>`;
}
