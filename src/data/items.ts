import type { Item } from "@/lib/types";

/**
 * Maria's rail. To add a real piece: drop photos into /public/items, then add
 * an entry here (or use the /admin dashboard). `image` is the card + inspect
 * front; add a `frames: []` array of evenly-rotated photos to turn the inspect
 * view into a 360° drag-to-spin.
 */
export const items: Item[] = [
  {
    id: "garad-silk-saree",
    name: "Garad Silk Saree",
    category: "Saree",
    brand: "Heritage Looms",
    size: "Free size · 5.5m + blouse piece",
    color: "Ivory & Red",
    occasions: ["Festival", "Wedding", "Reception"],
    pricePerDay: 40,
    retailValue: 120,
    description:
      "A festival classic — pure ivory silk with a deep red border and fine gold threadwork. Made for the grandest celebrations.",
    details: ["Pure silk", "Red & gold border", "Blouse piece included", "Dry clean only"],
    image: "/items/garad-silk-saree.svg",
    accent: "#B11C2A",
    unavailable: [{ from: "2026-09-26", to: "2026-10-02" }],
  },
  {
    id: "dhakai-jamdani-saree",
    name: "Dhakai Jamdani Saree",
    category: "Saree",
    brand: "Heirloom",
    size: "Free size · 5.5m + blouse piece",
    color: "Mist Grey",
    occasions: ["Reception", "Party", "Brunch"],
    pricePerDay: 55,
    retailValue: 240,
    description:
      "Handwoven jamdani in misty grey, scattered with delicate woven motifs floating in fine muslin. A heirloom-grade weave that feels like air.",
    details: ["Handloom muslin", "Woven floral motifs", "Featherlight drape", "Gentle dry clean"],
    image: "/items/dhakai-jamdani-saree.svg",
    accent: "#8C7A4B",
    unavailable: [],
  },
  {
    id: "baluchari-saree",
    name: "Baluchari Saree",
    category: "Saree",
    brand: "Bishnupur Weaves",
    size: "Free size · 5.5m + blouse piece",
    color: "Deep Maroon",
    occasions: ["Wedding", "Reception", "Gala"],
    pricePerDay: 50,
    retailValue: 200,
    description:
      "Rich maroon Baluchari silk with a pallu woven in golden narrative motifs. Regal enough for a wedding or reception.",
    details: ["Mulberry silk", "Woven motif pallu", "Gold threadwork", "Dry clean only"],
    image: "/items/baluchari-saree.svg",
    accent: "#7A1F2B",
    unavailable: [{ from: "2026-07-04", to: "2026-07-08" }],
  },
  {
    id: "royal-anarkali-suit",
    name: "Royal Anarkali Suit",
    category: "Suit",
    brand: "Rivelle",
    size: "M · with churidar & dupatta",
    color: "Peacock Teal",
    occasions: ["Party", "Reception", "Gala"],
    pricePerDay: 35,
    retailValue: 90,
    fit: { bust: 38, waist: 32, length: 56, note: "True to size; the churidar is stretchy." },
    description:
      "A floor-sweeping peacock-teal Anarkali with gold detailing, paired with churidar and a sheer dupatta. Twirl-ready for celebration nights.",
    details: ["Georgette flare", "Gold-trim yoke", "Churidar + dupatta", "Spot clean"],
    image: "/items/royal-anarkali-suit.svg",
    accent: "#13706A",
    unavailable: [],
  },
  {
    id: "marigold-tant-saree",
    name: "Marigold Tant Saree",
    category: "Saree",
    brand: "Heritage Looms",
    size: "Free size · 5.5m + blouse piece",
    color: "Marigold",
    occasions: ["Festival", "Brunch", "Date Night"],
    pricePerDay: 22,
    retailValue: 45,
    description:
      "A breezy marigold cotton with a contrasting red border — light, crisp and perfect for a daytime gathering or festival.",
    details: ["Handloom cotton", "Contrast red border", "Everyday-light", "Machine wash gentle"],
    image: "/items/marigold-tant-saree.svg",
    accent: "#E2952E",
    unavailable: [{ from: "2026-06-22", to: "2026-06-24" }],
  },
  {
    id: "gold-potli-bag",
    name: "Gold Embroidered Potli",
    category: "Accessories",
    brand: "Heirloom",
    size: "One size",
    color: "Antique Gold",
    occasions: ["Wedding", "Party", "Gala"],
    pricePerDay: 12,
    retailValue: 30,
    description:
      "A hand-embroidered drawstring potli in antique gold with a beaded tassel — the finishing touch that ties a festive look together.",
    details: ["Gold embroidery", "Beaded tassel", "Drawstring cord", "Spot clean"],
    image: "/items/gold-potli-bag.svg",
    accent: "#BF953F",
    unavailable: [],
  },
];

export function getItem(id: string): Item | undefined {
  return items.find((i) => i.id === id);
}
