// Server-only module: reads/writes the homepage lookbook. Never import from a client component.
import { promises as fs } from "fs";
import path from "path";
import { lookbook as seedLookbook, type LookEntry } from "@/data/lookbook";
import { blobEnabled, getJson, putJson } from "@/lib/blob";

const FILE = path.join(process.cwd(), "data", "lookbook.json");
const BLOB_KEY = "data/lookbook.json";

/**
 * The "The Edit" lookbook entries. Reads admin-edited storage (Vercel Blob when
 * connected, else data/lookbook.json) and falls back to the seed list in
 * src/data/lookbook.ts until the first admin save persists the full list.
 */
export async function getLookbook(): Promise<LookEntry[]> {
  if (blobEnabled()) {
    return getJson<LookEntry[]>(BLOB_KEY, seedLookbook);
  }
  try {
    const raw = await fs.readFile(FILE, "utf8");
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed)) return parsed as LookEntry[];
  } catch {
    /* not persisted yet */
  }
  return seedLookbook;
}

export async function saveLookbook(entries: LookEntry[]): Promise<{ stored: boolean }> {
  if (blobEnabled()) {
    return { stored: await putJson(BLOB_KEY, entries) };
  }
  try {
    await fs.mkdir(path.dirname(FILE), { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(entries, null, 2), "utf8");
    return { stored: true };
  } catch (err) {
    console.error("[lookbookStore] could not persist:", err);
    return { stored: false };
  }
}
