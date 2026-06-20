import { promises as fs } from "fs";
import path from "path";
import type { RentRequest } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "requests.json");

async function readAll(): Promise<RentRequest[]> {
  try {
    const raw = await fs.readFile(FILE, "utf8");
    return JSON.parse(raw) as RentRequest[];
  } catch {
    return [];
  }
}

/**
 * Append a rental request to data/requests.json. Best-effort: returns
 * { stored: false } if the filesystem isn't writable (e.g. serverless host)
 * so the caller can still confirm to the renter and fall back to email.
 */
export async function saveRequest(req: RentRequest): Promise<{ stored: boolean }> {
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    const all = await readAll();
    all.push(req);
    await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
    return { stored: true };
  } catch (err) {
    console.error("[requests] could not persist request:", err);
    return { stored: false };
  }
}
