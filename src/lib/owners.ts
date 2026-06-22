import { promises as fs } from "fs";
import path from "path";
import { blobEnabled, getJson, putJson } from "@/lib/blob";
import type { Owner } from "@/lib/types";

const DATA_DIR = path.join(process.cwd(), "data");
const FILE = path.join(DATA_DIR, "owners.json");
const BLOB_KEY = "data/owners.json";

async function readAll(): Promise<Owner[]> {
  if (blobEnabled()) return getJson<Owner[]>(BLOB_KEY, []);
  try {
    return JSON.parse(await fs.readFile(FILE, "utf8")) as Owner[];
  } catch {
    return [];
  }
}

async function writeAll(all: Owner[]): Promise<boolean> {
  if (blobEnabled()) return putJson(BLOB_KEY, all);
  try {
    await fs.mkdir(DATA_DIR, { recursive: true });
    await fs.writeFile(FILE, JSON.stringify(all, null, 2), "utf8");
    return true;
  } catch (err) {
    console.error("[owners] could not persist:", err);
    return false;
  }
}

export async function getOwners(): Promise<Owner[]> {
  return (await readAll()).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1));
}

export async function getOwnerById(id: string): Promise<Owner | undefined> {
  return (await readAll()).find((o) => o.id === id);
}

export async function getOwnerByEmail(email: string): Promise<Owner | undefined> {
  const e = email.trim().toLowerCase();
  return (await readAll()).find((o) => o.email.toLowerCase() === e);
}

export async function closetTaken(closet: string): Promise<boolean> {
  const c = closet.trim().toLowerCase();
  return (await readAll()).some((o) => o.closet.toLowerCase() === c);
}

export async function addOwner(owner: Owner): Promise<{ stored: boolean }> {
  const all = await readAll();
  all.push(owner);
  return { stored: await writeAll(all) };
}

export async function setOwnerStatus(id: string, status: Owner["status"]): Promise<Owner | null> {
  const all = await readAll();
  const idx = all.findIndex((o) => o.id === id);
  if (idx < 0) return null;
  all[idx] = { ...all[idx], status };
  await writeAll(all);
  return all[idx];
}
