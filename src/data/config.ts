export const siteConfig = {
  name: "Maria's Closet",
  tagline: "Borrow something beautiful.",
  description:
    "A small, curated closet of statement pieces — spin through the rail in 3D and reserve your next favourite look.",
  ownerName: "Maria",
  /**
   * Optional. If set, the rent-request confirmation offers an email fallback
   * (a pre-filled mailto:) so requests reach Maria even when local storage
   * isn't writable (e.g. on a serverless host).
   */
  ownerEmail: "",
  currencySymbol: "$",
};

export function money(amount: number): string {
  return `${siteConfig.currencySymbol}${amount.toLocaleString()}`;
}
