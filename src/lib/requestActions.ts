import { getRequests, patchRequest, updateRequestStatus } from "@/lib/requests";
import { addUnavailable, getItemById } from "@/lib/store";
import { sql } from "@/lib/db";
import { getSettings } from "@/lib/settings";
import { sendEmail, looksLikeEmail } from "@/lib/email";
import { formatPretty } from "@/lib/dates";
import { money, siteConfig, type RewardsSettings } from "@/data/config";
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

  const { rewards } = await getSettings();
  if (status === "approved") {
    const item = updated.itemId ? await getItemById(updated.itemId) : undefined;
    if (item) await addUnavailable(item.id, { from: updated.from, to: updated.to });

    // Rewards settle exactly once: claim the request by setting `adjustments`
    // from null to [] in one statement, so a double-click or re-approval can't
    // double-credit. Only the caller that wins the claim records the ledger.
    const claimed = await sql`
      update requests set adjustments = '[]'::jsonb where id = ${id} and adjustments is null returning id`;
    if (claimed.length) {
      const [all, referrals, credits] = await Promise.all([getRequests(), getReferrals(), getCredits()]);
      const plan = planRewards(updated, item, all, referrals, credits, rewards);
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
      html: status === "approved" ? await approvedEmail(updated, rewards) : declinedEmail(updated),
    });
  }
  return updated;
}

async function approvedEmail(r: RentRequest, rewards: RewardsSettings): Promise<string> {
  const adj = r.adjustments ?? [];
  const priceLines = adj.length
    ? `<ul>${adj.map((a) => `<li>${esc(a.label)}: −${money(a.amount)}</li>`).join("")}</ul>
       <p><b>You pay ${money(netTotal(r))}</b> (was ${money(r.total)}).</p>`
    : `<p>Total: <b>${money(r.total)}</b>.</p>`;

  // Every confirmed renter gets their own invite link.
  let invite = "";
  if (rewardsApplyTo(r.itemId ? await getItemById(r.itemId) : undefined, rewards)) {
    const ref = await ensureReferralCode(r.renterName, r.contact);
    const link = `${siteConfig.url}/?ref=${ref.code}`;
    invite = `<p>Know someone who'd love this? Share your link — they get ${money(
      rewards.welcomeOffer,
    )} off their first rental and you get ${money(rewards.referralReward)} credit:<br>
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
