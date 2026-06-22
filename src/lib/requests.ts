import { promises as fs } from "fs";
import path from "path";
import { blobEnabled, getJson, putJson } from "@/lib/blob";
import type { RentRequest } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "requests.json");
const BLOB_KEY = "data/requests.json";

async function readAll(): Promise<RentRequest[]> {
  if (blobEnabled()) return getJson<RentRequest[]>(BLOB_KEY, []);
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as RentRequest[];
  } catch {
    return [];
  }
}

async function writeAll(all: RentRequest[]): Promise<boolean> {
  if (blobEnabled()) return putJson(BLOB_KEY, all);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[requests] could not persist:", err);
    return false;
  }
}

export async function getRequests(): Promise<RentRequest[]> {
  const all = await readAll();
  return all.sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function saveRequest(req: RentRequest): Promise<{ stored: boolean }> {
  const all = await readAll();
  all.push(req);
  return { stored: await writeAll(all) };
}

export async function updateRequestStatus(
  id: string,
  status: RentRequest["status"],
): Promise<RentRequest | null> {
  const all = await readAll();
  const idx = all.findIndex((r) => r.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], status };
  await writeAll(all);
  return all[idx];
}
