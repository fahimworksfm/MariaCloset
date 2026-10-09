// Pure helpers shared by server and client code.
import { siteConfig, type RewardsSettings } from "@/data/config";

/** Whether this piece takes part in the rewards programme (see the rewards scope setting). */
export function rewardsApplyTo(
  item: { closet?: string } | undefined,
  rewards: Pick<RewardsSettings, "enabled" | "scope">,
): boolean {
  if (!rewards.enabled || !item) return false;
  return rewards.scope === "all" || (item.closet || siteConfig.ownerName) === siteConfig.ownerName;
}

/**
 * Emails compare case-insensitively. Phones compare by their last 10 digits,
 * so "+1 (555) 010-2030", "555-010-2030" and "15550102030" are one person —
 * this also absorbs trunk prefixes like "017…" vs "+88017…".
 */
export function normContact(contact: string): string {
  const s = contact.trim().toLowerCase();
  if (s.includes("@")) return s;
  const digits = s.replace(/\D/g, "");
  if (!digits) return s;
  return digits.length > 10 ? digits.slice(-10) : digits;
}

/** What the renter actually pays once reward adjustments are taken off. */
export function netTotal(r: { total: number; adjustments?: { amount: number }[] }): number {
  const off = (r.adjustments ?? []).reduce((s, a) => s + a.amount, 0);
  return Math.max(0, r.total - off);
}
