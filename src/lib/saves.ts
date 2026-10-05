import { promises as fs } from "fs";
import path from "path";
import { blobEnabled, getJson, putJson } from "@/lib/blob";

/**
 * Anonymous per-piece wishlist counts ({ itemId: saves }). Hearts live in each
 * visitor's browser, so this is the only server-side signal of what people
 * want. No identifiers are stored — just a running count.
 */
type Saves = Record<string, number>;

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "saves.json");
const BLOB_KEY = "data/saves.json";

export async function getSaves(): Promise<Saves> {
  if (blobEnabled()) return getJson<Saves>(BLOB_KEY, {});
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Saves;
  } catch {
    return {};
  }
}

async function writeSaves(all: Saves): Promise<boolean> {
  if (blobEnabled()) return putJson(BLOB_KEY, all);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[saves] could not persist:", err);
    return false;
  }
}

/** Add +1 / -1 to a piece's count, never below zero. */
export async function bumpSave(itemId: string, delta: 1 | -1): Promise<boolean> {
  const all = await getSaves();
  all[itemId] = Math.max(0, (all[itemId] ?? 0) + delta);
  return writeSaves(all);
}
