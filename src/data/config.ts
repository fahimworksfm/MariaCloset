export const siteConfig = {
  name: "Maria's Closet",
  tagline: "Borrow something beautiful.",
  description:
    "A curated closet of South Asian sarees and festive wear — spin through the rail in 3D and reserve your next favourite look for weddings, parties, or any reason to dress up.",
  ownerName: "Maria",
  /**
   * Optional. If set, the rent-request confirmation offers an email fallback
   * (a pre-filled mailto:) so requests reach Maria even when local storage
   * isn't writable (e.g. on a serverless host).
   */
  ownerEmail: "",
  currencySymbol: "$",
  /** Optional muted looping clip shown behind the homepage headline. "" hides it. */
  heroVideo: "/videos/saree-drift.mp4",
  /** Public address, used for links in emails (pages use the live origin). */
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://maria-closet.vercel.app",
};

/**
 * Referral & loyalty. Everything is applied when a request is approved, and
 * keyed by the renter's (normalised) email or phone — there are no renter
 * accounts. Amounts are whole dollars.
 */
export const rewardsConfig = {
  enabled: true,
  /** $ off a referred friend's first rental. */
  welcomeOffer: 10,
  /** $ credit to the inviter once that friend's first rental is confirmed. */
  referralReward: 10,
  /** Tiers by completed (approved) rentals before this one. Highest match wins. */
  tiers: [
    { name: "Member", minRentals: 0, discountPct: 0 },
    { name: "Regular", minRentals: 3, discountPct: 5 },
    { name: "Insider", minRentals: 6, discountPct: 10 },
  ],
  /**
   * Which pieces honour rewards. "maria" = Maria's own closet only, so other
   * closet owners never fund Maria's programme. Set to "all" to include every closet.
   */
  scope: "maria" as "maria" | "all",
};

export function money(amount: number): string {
  return `${siteConfig.currencySymbol}${amount.toLocaleString()}`;
}
