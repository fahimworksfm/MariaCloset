import type { LookEntry } from "@/data/lookbook";

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "look";

export function sanitizeLook(x: Record<string, unknown>): LookEntry | null {
  if (!x || typeof x !== "object") return null;
  const title = String(x.title ?? "").trim();
  if (!title) return null;
  const id = String(x.id ?? "").trim() || slugify(title);
  const accent =
    typeof x.accent === "string" && /^#[0-9a-fA-F]{3,8}$/.test(x.accent) ? x.accent : "#A8536B";
  return {
    id,
    kicker: String(x.kicker ?? "").slice(0, 60),
    title: title.slice(0, 80),
    caption: String(x.caption ?? "").slice(0, 200),
    accent,
    image: x.image ? String(x.image).trim() : undefined,
    video: x.video ? String(x.video).trim() : undefined,
    itemId: x.itemId ? String(x.itemId).trim() : undefined,
  };
}
