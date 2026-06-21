import { cookies } from "next/headers";

export const ADMIN_COOKIE = "mc_admin";

export function adminPassword(): string {
  return process.env.ADMIN_PASSWORD || "mariacloset";
}

/** Lightweight gate for a personal app: a shared password held in an httpOnly cookie. */
export function isAdmin(): boolean {
  const value = cookies().get(ADMIN_COOKIE)?.value;
  return !!value && value === adminPassword();
}
