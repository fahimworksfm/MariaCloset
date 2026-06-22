export type DateRange = { from: string; to: string };

export type Item = {
  id: string;
  name: string;
  category: string;
  brand?: string;
  size: string;
  color: string;
  /** Occasions this piece suits — powers filters & collections. */
  occasions?: string[];
  pricePerDay: number;
  retailValue?: number;
  description: string;
  details?: string[];
  /** Main image (used in the carousel and as the inspect-view front). */
  image: string;
  /** Optional 360° frame sequence — if present, the inspect view becomes drag-to-spin. */
  frames?: string[];
  /** Measurements (inches) + a fit note — powers the size & fit quiz. */
  fit?: { bust?: number; waist?: number; length?: number; note?: string };
  /** Whose closet this piece belongs to (defaults to the owner). */
  closet?: string;
  /** Accent colour (hex) used to theme the card glow + UI highlights. */
  accent: string;
  /** Date ranges this piece is already booked / unavailable (ISO yyyy-mm-dd). */
  unavailable: DateRange[];
};

export type Review = {
  id: string;
  itemId: string;
  name: string;
  rating: number; // 1–5
  text: string;
  approved: boolean;
  createdAt: string;
};

export type Owner = {
  id: string;
  closet: string; // display name of their closet (and the items' `closet` value)
  name: string;
  email: string;
  passwordHash: string;
  bio?: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
};

export type GiftCard = {
  id: string;
  code: string;
  amount: number;
  from: string;
  to: string;
  message?: string;
  createdAt: string;
};

export type WaitlistEntry = {
  id: string;
  itemId: string;
  itemName: string;
  contact: string;
  createdAt: string;
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
