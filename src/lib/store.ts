// Server-only module: reads/writes the catalog. Never import from a client component.
import { promises as fs } from "fs";
import path from "path";
import { items as seedItems } from "@/data/items";
import { blobEnabled, getJson, putJson } from "@/lib/blob";
import type { Item } from "@/lib/types";

const FILE = path.join(process.cwd(), "data", "items.json");
const BLOB_KEY = "data/items.json";

/**
 * The catalog. Reads admin-edited storage (Vercel Blob when connected, else
 * data/items.json) and falls back to the seed list in src/data/items.ts until
 * the first admin save persists the full list.
 */
export async function getItems(): Promise<Item[]> {
  if (blobEnabled()) {
    return getJson<Item[]>(BLOB_KEY, seedItems);
  }
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as Item[];
  } catch {
    /* not persisted yet */
  }
  return seedItems;
}

export async function getItemById(id: string): Promise<Item | undefined> {
  return (await getItems()).find((i) => i.id === id);
}

export async function saveItems(items: Item[]): Promise<{ stored: boolean }> {
  if (blobEnabled()) {
    return { stored: await putJson(BLOB_KEY, items) };
  }
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(items, null, 2), "utf8");
    return { stored: true };
  } catch (err) {
    console.error("[store] could not persist items:", err);
    return { stored: false };
  }
}
