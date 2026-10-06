// Server-only: referral codes, the reward-credit ledger, and the maths that
// turns a request into reward adjustments.
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { blobEnabled, getJson, putJson } from "@/lib/blob";
import { rewardsConfig } from "@/data/config";
import { normContact, rewardsApplyTo } from "@/lib/requestMath";
import { getRequests } from "@/lib/requests";
import { getItems } from "@/lib/store";
import type { CreditEntry, Item, Referral, RentRequest } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");

async function readList<T>(file: string): Promise<T[]> {
  if (blobEnabled()) return getJson<T[]>(`data/${file}`, []);
  try {
    return JSON.parse(await fs.readFile(path.join(DATA_DIR, file), "utf8")) as T[];
  } catch {
    return [];
  }
}

async function writeList<T>(file: string, all: T[]): Promise<boolean> {
  if (blobEnabled()) return putJson(`data/${file}`, all);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(path.join(DATA_DIR, file), JSON.stringify(all, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error(`[rewards] could not persist ${file}:`, err);
    return false;
  }
}

/* --------------------------------------------------------------- referrals */

export const getReferrals = () => readList<Referral>("referrals.json");

export async function getReferralByCode(code: string): Promise<Referral | undefined> {
  const c = code.trim().toUpperCase();
  return (await getReferrals()).find((r) => r.code === c);
}

// No 0/O/1/I so codes survive being read aloud or retyped.
const ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

/** One code per person (by normalised contact): returns the existing code if any. */
export async function ensureReferralCode(name: string, contact: string): Promise<Referral> {
  const all = await getReferrals();
  const key = normContact(contact);
  const existing = all.find((r) => r.contact === key);
  if (existing) return existing;

  const first = name.trim().split(/\s+/)[0] ?? "";
  const stem = first.toUpperCase().replace(/[^A-Z]/g, "").slice(0, 8) || "FRIEND";
  const taken = new Set(all.map((r) => r.code));
  let code = "";
  do {
    const suffix = Array.from({ length: 4 }, () => ALPHABET[Math.floor(Math.random() * ALPHABET.length)]).join("");
    code = `${stem}-${suffix}`;
  } while (taken.has(code));

  const ref: Referral = { code, name: first.slice(0, 40) || "A friend", contact: key, createdAt: new Date().toISOString() };
  await writeList("referrals.json", [...all, ref]);
  return ref;
}

/* ------------------------------------------------------------------ credit */

export const getCredits = () => readList<CreditEntry>("credits.json");

export function balanceOf(credits: CreditEntry[], contact: string): number {
  const key = normContact(contact);
  return credits.filter((c) => c.contact === key).reduce((s, c) => s + c.amount, 0);
}

/* ------------------------------------------------------------------- tiers */

export function tierFor(completedRentals: number) {
  return [...rewardsConfig.tiers].reverse().find((t) => completedRentals >= t.minRentals) ?? rewardsConfig.tiers[0];
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
): RewardPlan {
  const key = normContact(req.contact);
  const prior = allRequests.filter(
    (r) => r.id !== req.id && r.status === "approved" && normContact(r.contact) === key,
  ).length;
  const tier = tierFor(prior);
  const credit = Math.max(0, balanceOf(credits, req.contact));
  const plan: RewardPlan = { tier: tier.name, credit, adjustments: [], net: req.total, ledger: [] };
  if (!rewardsApplyTo(item)) return plan;

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
    take(`Welcome offer — invited by ${ref.name}`, rewardsConfig.welcomeOffer);
    plan.ledger.push({
      contact: ref.contact,
      amount: rewardsConfig.referralReward,
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
  tier: string;
  credit: number;
  adjustments: { label: string; amount: number }[];
  net: number;
};

/** What approving each pending request would do — for the requests screen. */
export async function rewardPreviews(requests: RentRequest[]): Promise<Record<string, RewardPreview>> {
  const pending = requests.filter((r) => r.status === "pending");
  if (!pending.length) return {};
  const [all, items, referrals, credits] = await Promise.all([
    getRequests(),
    getItems(),
    getReferrals(),
    getCredits(),
  ]);
  const out: Record<string, RewardPreview> = {};
  for (const r of pending) {
    const item = items.find((i) => i.id === r.itemId);
    const plan = planRewards(r, item, all, referrals, credits);
    out[r.id] = {
      applies: rewardsApplyTo(item),
      tier: plan.tier,
      credit: plan.credit,
      adjustments: plan.adjustments,
      net: plan.net,
    };
  }
  return out;
}

/** Record a plan's ledger movements (one write). */
export async function recordLedger(entries: RewardPlan["ledger"]): Promise<void> {
  if (!entries.length) return;
  const all = await getCredits();
  const now = new Date().toISOString();
  await writeList("credits.json", [
    ...all,
    ...entries.map((e) => ({ ...e, id: randomUUID(), createdAt: now })),
  ]);
}
