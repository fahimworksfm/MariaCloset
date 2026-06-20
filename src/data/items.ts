import type { Item } from "@/lib/types";

/**
 * Maria's rail. To add a real piece: drop photos into /public/items, then add
 * an entry here. `image` is the card + inspect front; add a `frames: []` array
 * of evenly-rotated photos to turn the inspect view into a 360° drag-to-spin.
 */
export const items: Item[] = [
  {
    id: "emerald-silk-gown",
    name: "Emerald Silk Gown",
    category: "Gowns",
    brand: "Atelier M.",
    size: "UK 8 / US 4",
    color: "Emerald",
    pricePerDay: 45,
    retailValue: 680,
    description:
      "A bias-cut silk gown in deep emerald that moves like water. Cowl back, floor-sweeping hem — made for an entrance.",
    details: ["100% silk", "Cowl drape back", "Hidden side zip", "Dry clean only"],
    image: "/items/emerald-silk-gown.svg",
    accent: "#2C5E4F",
    unavailable: [{ from: "2026-06-26", to: "2026-06-29" }],
  },
  {
    id: "blush-wrap-dress",
    name: "Blush Wrap Dress",
    category: "Dresses",
    brand: "Rivelle",
    size: "UK 10 / US 6",
    color: "Blush",
    pricePerDay: 28,
    retailValue: 240,
    description:
      "A soft blush wrap dress with a flattering tie waist — the easy yes for brunches, showers and garden parties.",
    details: ["Crêpe de chine", "Adjustable wrap tie", "Midi length", "Machine wash cold"],
    image: "/items/blush-wrap-dress.svg",
    accent: "#D98C9A",
    unavailable: [],
  },
  {
    id: "camel-tailored-blazer",
    name: "Camel Tailored Blazer",
    category: "Tailoring",
    brand: "Maison Cole",
    size: "UK 8–10",
    color: "Camel",
    pricePerDay: 22,
    retailValue: 320,
    description:
      "A sharp single-breasted blazer in warm camel wool. Throw it over everything and look instantly put-together.",
    details: ["Wool blend", "Single button", "Fully lined", "Padded shoulder"],
    image: "/items/camel-tailored-blazer.svg",
    accent: "#C49A6C",
    unavailable: [{ from: "2026-07-03", to: "2026-07-06" }],
  },
  {
    id: "midnight-sequin-dress",
    name: "Midnight Sequin Dress",
    category: "Occasion",
    brand: "Lune",
    size: "UK 6 / US 2",
    color: "Midnight",
    pricePerDay: 38,
    retailValue: 410,
    description:
      "All-over midnight sequins with a column silhouette. New Year's, galas, the kind of night you'll want photos of.",
    details: ["Hand-sewn sequins", "Concealed zip", "Knee length", "Spot clean"],
    image: "/items/midnight-sequin-dress.svg",
    accent: "#2B3A67",
    unavailable: [],
  },
  {
    id: "ivory-linen-jumpsuit",
    name: "Ivory Linen Jumpsuit",
    category: "Jumpsuits",
    brand: "Sable",
    size: "UK 10 / US 6",
    color: "Ivory",
    pricePerDay: 26,
    retailValue: 215,
    description:
      "A breezy wide-leg linen jumpsuit in ivory with a halter neck. Effortless from beach club to dinner.",
    details: ["Washed linen", "Halter tie neck", "Side pockets", "Machine wash cold"],
    image: "/items/ivory-linen-jumpsuit.svg",
    accent: "#E7DCC6",
    unavailable: [{ from: "2026-06-22", to: "2026-06-24" }],
  },
  {
    id: "burgundy-velvet-clutch",
    name: "Burgundy Velvet Clutch",
    category: "Accessories",
    brand: "Atelier M.",
    size: "One size",
    color: "Burgundy",
    pricePerDay: 12,
    retailValue: 130,
    description:
      "A jewel-toned velvet clutch with a gold clasp — the finishing touch that pulls a whole look together.",
    details: ["Cotton velvet", "Gold-tone clasp", "Detachable chain", "Spot clean"],
    image: "/items/burgundy-velvet-clutch.svg",
    accent: "#6E2433",
    unavailable: [],
  },
];

export function getItem(id: string): Item | undefined {
  return items.find((i) => i.id === id);
}
