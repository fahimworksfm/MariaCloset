// Loads .env.local / .env (as `vercel env pull` writes them) without a dependency.
import { existsSync, readFileSync } from "fs";

for (const f of [".env.local", ".env"]) {
  if (!existsSync(f)) continue;
  for (const line of readFileSync(f, "utf8").split("\n")) {
    const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/);
    if (!m || process.env[m[1]] !== undefined) continue;
    process.env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
  }
}

/** Direct (non-pooled) connection — right for migrations and seeding. */
export function directUrl() {
  const url = process.env.POSTGRES_URL_NON_POOLING || process.env.DATABASE_URL || process.env.POSTGRES_URL;
  if (!url) {
    console.error("No database URL. Run `vercel env pull .env.local` first (needs POSTGRES_URL_NON_POOLING).");
    process.exit(1);
  }
  return url;
}

export const sslFor = (url) => (/localhost|127\.0\.0\.1/.test(url) ? false : "require");
