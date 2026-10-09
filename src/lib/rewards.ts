// Server-only: referral codes, the reward-credit ledger, and the maths that
// turns a request into reward adjustments.
import { randomUUID } from "crypto";
import { sql, iso, num, opt } from "@/lib/db";
import type { RewardsSettings, RewardTier } from "@/data/config";
import { normContact, rewardsApplyTo } from "@/lib/requestMath";
import { getRequests } from "@/lib/requests";
import { getSettings } from "@/lib/settings";
import { getItems } from "@/lib/store";
import type { CreditEntry, Item, Referral, RentRequest } from "@/lib/types";

/* --------------------------------------------------------------- referrals */

type ReferralRow = { code: string; name: string; contact: string; created_at: Date };
const referralFrom = (r: ReferralRow): Referral => ({
  code: r.code,
  name: r.name,
  contact: r.contact,
  createdAt: iso(r.created_at),
});

export async function getReferrals(): Promise<Referral[]> {
  return (await sql<ReferralRow[]>`select * from referrals order by created_at`).map(referralFrom);
}

export async function getReferralByCode(code: string): Promise<Referral | undefined> {
  const [row] = await sql<ReferralRow[]>`select * from referrals where code = ${code.trim().toUpperCase()}`;
  return row ? referralFrom(row) : undefined;
}

// No 0/O/1/I so codes survive being read aloud or retyped.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** One code per person (by normalised contact): returns the existing code if any. */
export async function ensureReferralCode(name: string, contact: string): Promise<Referral> {
  const key = normContact(contact);
  const [existing] = await sql<ReferralRow[]>`select * from referrals where contact = ${key}`;
  if (existing) return referralFrom(existing);

  const first = name.trim().split(/\s+/)[0] ?? "";
  const stem = first.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "FRIEND";
  const display = first.slice(0, 40) || "A friend";
  for (;;) {
    const suffix = Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
    // Code clash → retry with a new suffix; contact clash (a concurrent call won) → return theirs.
    const [row] = await sql<ReferralRow[]>`
      insert into referrals (code, name, contact) values (${`${stem}-${suffix}`}, ${display}, ${key})
      on conflict do nothing returning *`;
    if (row) return referralFrom(row);
    const [theirs] = await sql<ReferralRow[]>`select * from referrals where contact = ${key}`;
    if (theirs) return referralFrom(theirs);
  }
}

/* ------------------------------------------------------------------ credit */

type CreditRow = {
  id: string;
  contact: string;
  amount: string;
  reason: string;
  request_id: string | null;
  created_at: Date;
};

export async function getCredits(): Promise<CreditEntry[]> {
  const rows = await sql<CreditRow[]>`select * from credits order by created_at`;
  return rows.map((r) => ({
    id: r.id,
    contact: r.contact,
    amount: num(r.amount),
    reason: r.reason,
    requestId: opt(r.request_id),
    createdAt: iso(r.created_at),
  }));
}

export function balanceOf(credits: CreditEntry[], contact: string): number {
  const key = normContact(contact);
  return credits.filter((c) => c.contact === key).reduce((s, c) => s + c.amount, 0);
}

/* ------------------------------------------------------------------- tiers */

export function tierFor(completedRentals: number, tiers: RewardTier[]): RewardTier {
  return (
    [...tiers].reverse().find((t) => completedRentals >= t.minRentals) ??
    tiers[0] ?? { name: "Member", minRentals: 0, discountPct: 0 }
  );
}

export { rewardsApplyTo };

/* -------------------------------------------------------------- the plan */

export type RewardPlan = {
  tier: string;
  credit: number;
  adjustments: { label: string; amount: number }[];
  net: number;
  /** Ledger movements to record if this plan is applied. */
  ledger: Omit<CreditEntry, "id" | "createdAt">[];
};

/**
 * Pure: what approving `req` would do. Used for the admin preview and for the
 * real approval, so the preview is exactly what gets applied. Order: tier
 * discount, then the welcome offer (first rental via an invite), then credit.
 */
export function planRewards(
  req: RentRequest,
  item: Item | undefined,
  allRequests: RentRequest[],
  referrals: Referral[],
  credits: CreditEntry[],
  rewards: RewardsSettings,
): RewardPlan {
  const key = normContact(req.contact);
  const prior = allRequests.filter(
    (r) => r.id !== req.id && r.status === "approved" && normContact(r.contact) === key,
  ).length;
  const tier = tierFor(prior, rewards.tiers);
  const credit = Math.max(0, balanceOf(credits, req.contact));
  const plan: RewardPlan = { tier: tier.name, credit, adjustments: [], net: req.total, ledger: [] };
  if (!rewardsApplyTo(item, rewards)) return plan;

  let remaining = req.total;
  const take = (label: string, want: number) => {
    const amount = Math.min(remaining, Math.max(0, Math.round(want)));
    if (amount > 0) {
      plan.adjustments.push({ label, amount });
      remaining -= amount;
    }
    return amount;
  };

  if (tier.discountPct > 0) take(`${tier.name} — ${tier.discountPct}% off`, (req.total * tier.discountPct) / 100);

  const ref = req.referralCode ? referrals.find((r) => r.code === req.referralCode) : undefined;
  if (ref && prior === 0 && ref.contact !== key) {
    take(`Welcome offer — invited by ${ref.name}`, rewards.welcomeOffer);
    plan.ledger.push({
      contact: ref.contact,
      amount: rewards.referralReward,
      reason: `Invited ${req.renterName.split(" ")[0] || "a friend"} (${req.itemName})`,
      requestId: req.id,
    });
  }

  const used = credit > 0 ? take("Reward credit", credit) : 0;
  if (used > 0) {
    plan.ledger.push({ contact: key, amount: -used, reason: `Applied to ${req.itemName}`, requestId: req.id });
  }

  plan.net = remaining;
  return plan;
}

export type RewardPreview = {
  applies: boolean;
  /** True when the renter is still on the starting tier (nothing to call out). */
  baseTier: boolean;
  tier: string;
  credit: number;
  adjustments: { label: string; amount: number }[];
  net: number;
};

/** What approving each pending request would do — for the requests screen. */
export async function rewardPreviews(requests: RentRequest[]): Promise<Record<string, RewardPreview>> {
  const pending = requests.filter((r) => r.status === "pending");
  if (!pending.length) return {};
  const [all, items, referrals, credits, { rewards }] = await Promise.all([
    getRequests(),
    getItems(),
    getReferrals(),
    getCredits(),
    getSettings(),
  ]);
  const out: Record<string, RewardPreview> = {};
  for (const r of pending) {
    const item = items.find((i) => i.id === r.itemId);
    const plan = planRewards(r, item, all, referrals, credits, rewards);
    out[r.id] = {
      applies: rewardsApplyTo(item, rewards),
      baseTier: plan.tier === rewards.tiers[0]?.name,
      tier: plan.tier,
      credit: plan.credit,
      adjustments: plan.adjustments,
      net: plan.net,
    };
  }
  return out;
}

/** Record a plan's ledger movements (one transaction). */
export async function recordLedger(entries: RewardPlan["ledger"]): Promise<void> {
  if (!entries.length) return;
  const rows = entries.map((e) => ({
    id: randomUUID(),
    contact: e.contact,
    amount: e.amount,
    reason: e.reason,
    request_id: e.requestId ?? null,
  }));
  await sql`insert into credits ${sql(rows as never)}`;
}
