export type DateRange = { from: string; to: string };

export type Item = {
  id: string;
  name: string;
  category: string;
  brand?: string;
  size: string;
  color: string;
  pricePerDay: number;
  retailValue?: number;
  description: string;
  details?: string[];
  /** Main image (used in the carousel and as the inspect-view front). */
  image: string;
  /** Optional 360° frame sequence — if present, the inspect view becomes drag-to-spin. */
  frames?: string[];
  /** Accent colour (hex) used to theme the card glow + UI highlights. */
  accent: string;
  /** Date ranges this piece is already booked / unavailable (ISO yyyy-mm-dd). */
  unavailable: DateRange[];
};

export type RentRequest = {
  id: string;
  itemId: string;
  itemName: string;
  renterName: string;
  contact: string;
  from: string;
  to: string;
  days: number;
  total: number;
  message?: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
};
