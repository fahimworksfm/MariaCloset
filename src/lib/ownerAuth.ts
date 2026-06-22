import { cookies } from "next/headers";
import { createHmac } from "crypto";
import { isAdmin } from "@/lib/auth";
import { getOwnerById } from "@/lib/owners";
import type { Owner } from "@/lib/types";

export const OWNER_COOKIE = "mc_owner";

function secret(): string {
  return process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD || "mariacloset-session";
}
function sign(id: string): string {
  return createHmac("sha256", secret()).update(id).digest("hex").slice(0, 32);
}
export function ownerCookieValue(id: string): string {
  return `${id}.${sign(id)}`;
}

/** Sync: the signed-in owner id if the cookie is valid (no store hit). */
export function readOwnerId(): string | null {
  const v = cookies().get(OWNER_COOKIE)?.value;
  if (!v) return null;
  const dot = v.lastIndexOf(".");
  if (dot < 0) return null;
  const id = v.slice(0, dot);
  return v.slice(dot + 1) === sign(id) ? id : null;
}

/** Async: the full owner record, only if still approved. */
export async function getCurrentOwner(): Promise<Owner | null> {
  const id = readOwnerId();
  if (!id) return null;
  const owner = await getOwnerById(id);
  return owner && owner.status === "approved" ? owner : null;
}

/** Cheap gate for shared endpoints (upload, AI). */
export function isOwnerOrAdmin(): boolean {
  return isAdmin() || !!readOwnerId();
}
