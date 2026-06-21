import { promises as fs } from "fs";
import path from "path";
import { blobEnabled, getJson, putJson } from "@/lib/blob";
import type { RentRequest } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "requests.json");
const BLOB_KEY = "data/requests.json";

async function readAllFs(): Promise<RentRequest[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as RentRequest[];
  } catch {
    return [];
  }
}

/**
 * Append a rental request. Uses Vercel Blob when connected, else the local
 * filesystem. Best-effort: returns { stored: false } if storage isn't writable
 * so the caller can still confirm to the renter and fall back to email.
 */
export async function saveRequest(req: RentRequest): Promise<{ stored: boolean }> {
  if (blobEnabled()) {
    const all = await getJson<RentRequest[]>(BLOB_KEY, []);
    all.push(req);
    return { stored: await putJson(BLOB_KEY, all) };
  }
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const all = await readAllFs();
    all.push(req);
    await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
    return { stored: true };
  } catch (err) {
    console.error("[requests] could not persist request:", err);
    return { stored: false };
  }
}
