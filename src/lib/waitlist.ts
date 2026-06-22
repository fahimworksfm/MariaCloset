import { promises as fs } from "fs";
import path from "path";
import { blobEnabled, getJson, putJson } from "@/lib/blob";
import type { WaitlistEntry } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "waitlist.json");
const BLOB_KEY = "data/waitlist.json";

async function readAll(): Promise<WaitlistEntry[]> {
  if (blobEnabled()) return getJson<WaitlistEntry[]>(BLOB_KEY, []);
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as WaitlistEntry[];
  } catch {
    return [];
  }
}

async function writeAll(all: WaitlistEntry[]): Promise<boolean> {
  if (blobEnabled()) return putJson(BLOB_KEY, all);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[waitlist] could not persist:", err);
    return false;
  }
}

export async function getWaitlist(): Promise<WaitlistEntry[]> {
  return (await readAll()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function addWaitlist(entry: WaitlistEntry): Promise<{ stored: boolean }> {
  const all = await readAll();
  all.push(entry);
  return { stored: await writeAll(all) };
}
