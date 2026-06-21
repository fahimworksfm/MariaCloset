import type { Item } from "@/lib/types";

/**
 * Maria's rail — a Bengali almari. To add a real piece: drop photos into
 * /public/items, then add an entry here. `image` is the card + inspect front;
 * add a `frames: []` array of evenly-rotated photos to turn the inspect view
 * into a 360° drag-to-spin.
 */
export const items: Item[] = [
  {
    id: "garad-silk-saree",
    name: "Garad Silk Saree",
    nameBn: "গরদ সিল্ক শাড়ি",
    category: "Saree",
    brand: "Tant Ghar",
    size: "Free size · 5.5m + blouse piece",
    color: "Ivory & Red",
    pricePerDay: 600,
    retailValue: 8000,
    description:
      "The quintessential pujo saree — pure ivory garad silk with a deep red border and fine gold zari. Made for Ashtami anjali and shidur khela.",
    details: ["Pure garad silk", "Red & zari border (paar)", "Blouse piece included", "Dry clean only"],
    image: "/items/garad-silk-saree.svg",
    accent: "#B11C2A",
    unavailable: [{ from: "2026-09-26", to: "2026-10-02" }],
  },
  {
    id: "dhakai-jamdani-saree",
    name: "Dhakai Jamdani Saree",
    nameBn: "ঢাকাই জামদানি",
    category: "Saree",
    brand: "Heirloom",
    size: "Free size · 5.5m + blouse piece",
    color: "Mist Grey",
    pricePerDay: 900,
    retailValue: 18000,
    description:
      "Handwoven Dhakai jamdani in misty grey, scattered with delicate buti motifs floating in fine muslin. A heirloom-grade weave that feels like air.",
    details: ["Handloom muslin", "Woven buti motifs", "Featherlight drape", "Gentle dry clean"],
    image: "/items/dhakai-jamdani-saree.svg",
    accent: "#8C7A4B",
    unavailable: [],
  },
  {
    id: "baluchari-saree",
    name: "Baluchari Saree",
    nameBn: "বালুচরী শাড়ি",
    category: "Saree",
    brand: "Bishnupur Weaves",
    size: "Free size · 5.5m + blouse piece",
    color: "Deep Maroon",
    pricePerDay: 800,
    retailValue: 15000,
    description:
      "Rich maroon Baluchari silk from Bishnupur, its pallu woven with golden narrative motifs. Regal enough for a biye or bou-bhaat.",
    details: ["Mulberry silk", "Woven story pallu", "Gold zari work", "Dry clean only"],
    image: "/items/baluchari-saree.svg",
    accent: "#7A1F2B",
    unavailable: [{ from: "2026-07-04", to: "2026-07-08" }],
  },
  {
    id: "royal-anarkali-suit",
    name: "Royal Anarkali Suit",
    nameBn: "রাজকীয় আনারকলি",
    category: "Suit",
    brand: "Rivaaz",
    size: "M · with churidar & dupatta",
    color: "Peacock Teal",
    pricePerDay: 500,
    retailValue: 6000,
    description:
      "A floor-sweeping peacock-teal Anarkali with gold gota detailing, paired with churidar and a sheer dupatta. Twirl-ready for sangeet nights.",
    details: ["Georgette flare", "Gota & zari yoke", "Churidar + dupatta", "Spot clean"],
    image: "/items/royal-anarkali-suit.svg",
    accent: "#13706A",
    unavailable: [],
  },
  {
    id: "marigold-tant-saree",
    name: "Marigold Tant Saree",
    nameBn: "গাঁদা তাঁত শাড়ি",
    category: "Saree",
    brand: "Tant Ghar",
    size: "Free size · 5.5m + blouse piece",
    color: "Marigold",
    pricePerDay: 350,
    retailValue: 2500,
    description:
      "A breezy marigold tant cotton with a contrasting red border — light, crisp and perfect for a daytime adda or Saraswati pujo.",
    details: ["Handloom cotton", "Contrast red border", "Everyday-light", "Machine wash gentle"],
    image: "/items/marigold-tant-saree.svg",
    accent: "#E2952E",
    unavailable: [{ from: "2026-06-22", to: "2026-06-24" }],
  },
  {
    id: "gold-potli-bag",
    name: "Gold Embroidered Potli",
    nameBn: "সোনালি পুঁটলি",
    category: "Accessories",
    brand: "Heirloom",
    size: "One size",
    color: "Antique Gold",
    pricePerDay: 150,
    retailValue: 1200,
    description:
      "A hand-embroidered drawstring potli in antique gold with a beaded tassel — the finishing touch that ties a festive look together.",
    details: ["Zardozi embroidery", "Beaded tassel", "Drawstring cord", "Spot clean"],
    image: "/items/gold-potli-bag.svg",
    accent: "#BF953F",
    unavailable: [],
  },
];

export function getItem(id: string): Item | undefined {
  return items.find((i) => i.id === id);
}
