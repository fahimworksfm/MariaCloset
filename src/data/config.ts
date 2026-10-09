/** Fixed identity. Everything editable lives in Settings (admin → Settings). */
export const siteConfig = {
  name: "Maria's Closet",
  ownerName: "Maria",
  currencySymbol: "$",
  /** Public address, used for links in emails (pages use the live origin). */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://maria-closet.vercel.app",
};

export type RewardTier = { name: string; minRentals: number; discountPct: number };

/** Admin-editable site copy. These are only the defaults until Settings are saved. */
export type SiteSettings = {
  tagline: string;
  description: string;
  /**
   * Optional. If set, new-request emails go here, and the rent-request
   * confirmation offers an email fallback (a pre-filled mailto:).
   */
  ownerEmail: string;
  /** Optional muted looping clip shown behind the homepage headline. "" hides it. */
  heroVideo: string;
};

/**
 * Referral & loyalty. Everything is applied when a request is approved, and
 * keyed by the renter's (normalised) email or phone — there are no renter
 * accounts. Amounts are whole dollars.
 */
export type RewardsSettings = {
  enabled: boolean;
  /** $ off a referred friend's first rental. */
  welcomeOffer: number;
  /** $ credit to the inviter once that friend's first rental is confirmed. */
  referralReward: number;
  /** Tiers by completed (approved) rentals before this one. Highest match wins. */
  tiers: RewardTier[];
  /**
   * Which pieces honour rewards. "maria" = Maria's own closet only, so other
   * closet owners never fund Maria's programme. "all" includes every closet.
   */
  scope: "maria" | "all";
};

export type Settings = { site: SiteSettings; rewards: RewardsSettings };

export const defaultSettings: Settings = {
  site: {
    tagline: "Borrow something beautiful.",
    description:
      "A curated closet of South Asian sarees and festive wear — spin through the rail in 3D and reserve your next favourite look for weddings, parties, or any reason to dress up.",
    ownerEmail: "",
    heroVideo: "/videos/saree-drift.mp4",
  },
  rewards: {
    enabled: true,
    welcomeOffer: 10,
    referralReward: 10,
    tiers: [
      { name: "Member", minRentals: 0, discountPct: 0 },
      { name: "Regular", minRentals: 3, discountPct: 5 },
      { name: "Insider", minRentals: 6, discountPct: 10 },
    ],
    scope: "maria",
  },
};

export function money(amount: number): string {
  return `${siteConfig.currencySymbol}${amount.toLocaleString()}`;
}
