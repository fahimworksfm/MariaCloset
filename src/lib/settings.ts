// Server-only. Admin-editable settings, stored as two JSON rows ('site', 'rewards').
import { cache } from "react";
import { sql } from "@/lib/db";
import { defaultSettings, type RewardTier, type Settings } from "@/data/config";

/** Current settings: saved values over the defaults in src/data/config.ts. Cached per request. */
export const getSettings = cache(async (): Promise<Settings> => {
  try {
    const rows = await sql<{ key: string; value: Record<string, unknown> }[]>`select key, value from settings`;
    const saved = Object.fromEntries(rows.map((r) => [r.key, r.value]));
    return {
      site: { ...defaultSettings.site, ...(saved.site ?? {}) },
      rewards: { ...defaultSettings.rewards, ...(saved.rewards ?? {}) },
    };
  } catch (err) {
    console.error("[settings] read failed, using defaults:", err);
    return defaultSettings;
  }
});

const str = (v: unknown, max: number) => String(v ?? "").trim().slice(0, max);
const whole = (v: unknown, max: number) => Math.min(max, Math.max(0, Math.round(Number(v) || 0)));

/** Validate an untrusted settings payload; returns null if it's unusable. */
export function sanitizeSettings(x: unknown): Settings | null {
  if (!x || typeof x !== "object") return null;
  const { site = {}, rewards = {} } = x as { site?: Record<string, unknown>; rewards?: Record<string, unknown> };
  const ownerEmail = str(site.ownerEmail, 200);
  if (ownerEmail && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(ownerEmail)) return null;

  const tiers: RewardTier[] = (Array.isArray(rewards.tiers) ? rewards.tiers : [])
    .slice(0, 8)
    .map((t: Record<string, unknown>) => ({
      name: str(t?.name, 30),
      minRentals: whole(t?.minRentals, 1000),
      discountPct: whole(t?.discountPct, 90),
    }))
    .filter((t) => t.name)
    .sort((a, b) => a.minRentals - b.minRentals);
  // The first tier is everyone's starting tier.
  if (!tiers.length || tiers[0].minRentals !== 0) tiers.unshift({ name: "Member", minRentals: 0, discountPct: 0 });

  return {
    site: {
      tagline: str(site.tagline, 120) || defaultSettings.site.tagline,
      description: str(site.description, 600),
      ownerEmail,
      heroVideo: str(site.heroVideo, 500),
    },
    rewards: {
      enabled: rewards.enabled !== false,
      welcomeOffer: whole(rewards.welcomeOffer, 1000),
      referralReward: whole(rewards.referralReward, 1000),
      tiers,
      scope: rewards.scope === "all" ? "all" : "maria",
    },
  };
}

export async function saveSettings(s: Settings): Promise<{ stored: boolean }> {
  try {
    await sql`
      insert into settings ${sql(
        [
          { key: "site", value: sql.json(s.site) },
          { key: "rewards", value: sql.json(s.rewards) },
        ] as never,
      )}
      on conflict (key) do update set value = excluded.value, updated_at = now()`;
    return { stored: true };
  } catch (err) {
    console.error("[settings] could not persist:", err);
    return { stored: false };
  }
}
