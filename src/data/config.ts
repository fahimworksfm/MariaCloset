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
};

export function money(amount: number): string {
  return `${siteConfig.currencySymbol}${amount.toLocaleString()}`;
}
