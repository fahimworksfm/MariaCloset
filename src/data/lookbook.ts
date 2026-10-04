/**
 * Editorial "lookbook" entries for the homepage "The Edit" section.
 *
 * Each tile shows a refined accent-gradient plate until a real photo exists at
 * `image`. Drop a file at that path under `public/lookbook/` (or point `image`
 * at a Vercel Blob URL) and the tile upgrades to the photo automatically —
 * no code change needed. Recommended: clean editorial / lifestyle shots,
 * roughly portrait 4:5 for features and landscape 16:10 for the rest.
 */
export type LookEntry = {
  id: string;
  kicker: string;
  title: string;
  caption: string;
  accent: string;
  /** Path under /public (e.g. "/lookbook/wedding.jpg") or a full Blob URL. */
  image?: string;
  /** Optional short muted clip that plays on hover over this tile. */
  video?: string;
  /** Optional piece this look links to. */
  itemId?: string;
};

export const lookbook: LookEntry[] = [
  {
    id: "grand-entrance",
    kicker: "Wedding season",
    title: "The Grand Entrance",
    caption: "Heirloom silks and hand-worked zari for the day everyone remembers.",
    accent: "#A8536B",
    image: "/lookbook/wedding-feature.jpg",
    video: "/videos/lehenga-turn.mp4",
    itemId: "garad-silk-saree",
  },
  {
    id: "after-dark",
    kicker: "Reception",
    title: "After Dark",
    caption: "Deep jewel tones that catch the light.",
    accent: "#5A4A86",
    image: "/lookbook/reception.jpg",
    video: "/videos/saree-drift.mp4",
    itemId: "royal-anarkali-suit",
  },
  {
    id: "marigold-hour",
    kicker: "Mehndi",
    title: "Marigold Hour",
    caption: "Easy drape, golden warmth.",
    accent: "#C99A52",
    image: "/lookbook/mehndi.jpg",
    itemId: "marigold-tant-saree",
  },
  {
    id: "quiet-edit",
    kicker: "Everyday luxe",
    title: "The Quiet Edit",
    caption: "Understated weaves for dinners, soirées, and slow Sundays.",
    accent: "#3E8C82",
    image: "/lookbook/everyday.jpg",
    itemId: "dhakai-jamdani-saree",
  },
  {
    id: "the-details",
    kicker: "Finishing touches",
    title: "The Details",
    caption: "Potli bags and gold that complete the look.",
    accent: "#C9A24B",
    image: "/lookbook/details.jpg",
    itemId: "gold-potli-bag",
  },
];
