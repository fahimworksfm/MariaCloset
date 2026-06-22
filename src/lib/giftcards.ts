import { promises as fs } from "fs";
import path from "path";
import { blobEnabled, getJson, putJson } from "@/lib/blob";
import type { GiftCard } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "giftcards.json");
const BLOB_KEY = "data/giftcards.json";

async function readAll(): Promise<GiftCard[]> {
  if (blobEnabled()) return getJson<GiftCard[]>(BLOB_KEY, []);
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as GiftCard[];
  } catch {
    return [];
  }
}

async function writeAll(all: GiftCard[]): Promise<boolean> {
  if (blobEnabled()) return putJson(BLOB_KEY, all);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[giftcards] could not persist:", err);
    return false;
  }
}

export async function getGiftCards(): Promise<GiftCard[]> {
  return readAll();
}

export async function addGiftCard(card: GiftCard): Promise<{ stored: boolean }> {
  const all = await readAll();
  all.push(card);
  return { stored: await writeAll(all) };
}
