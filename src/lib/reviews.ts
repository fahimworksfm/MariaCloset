import { promises as fs } from "fs";
import path from "path";
import { blobEnabled, getJson, putJson } from "@/lib/blob";
import type { Review } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "reviews.json");
const BLOB_KEY = "data/reviews.json";

async function readAll(): Promise<Review[]> {
  if (blobEnabled()) return getJson<Review[]>(BLOB_KEY, []);
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Review[];
  } catch {
    return [];
  }
}

async function writeAll(all: Review[]): Promise<boolean> {
  if (blobEnabled()) return putJson(BLOB_KEY, all);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[reviews] could not persist:", err);
    return false;
  }
}

export async function getReviews(): Promise<Review[]> {
  return (await readAll()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function approvedForItem(itemId: string): Promise<Review[]> {
  return (await getReviews()).filter((r) => r.approved && r.itemId === itemId);
}

export async function addReview(review: Review): Promise<{ stored: boolean }> {
  const all = await readAll();
  all.push(review);
  return { stored: await writeAll(all) };
}

export async function setApproved(id: string, approved: boolean): Promise<Review | null> {
  const all = await readAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], approved };
  await writeAll(all);
  return all[idx];
}

export async function removeReview(id: string): Promise<boolean> {
  const all = await readAll();
  const next = all.filter((r) => r.id !== id);
  if (next.length === all.length) return false;
  return writeAll(next);
}
