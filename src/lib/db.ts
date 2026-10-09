// Server-only. One Postgres client for the whole app (Supabase via its pooler).
// Tables have RLS on with no policies, so nothing is reachable through
// Supabase's public API — every read/write goes through our API routes.
import postgres from "postgres";

declare global {
  // eslint-disable-next-line no-var
  var __sql: ReturnType<typeof postgres> | undefined;
}

function dbUrl(): string | undefined {
  return process.env.POSTGRES_URL || process.env.DATABASE_URL || process.env.POSTGRES_URL_NON_POOLING;
}

/** True when a database connection string is configured. */
export function dbEnabled(): boolean {
  return !!dbUrl();
}

function client() {
  const url = dbUrl();
  if (!url) throw new Error("No database configured — set POSTGRES_URL (run `vercel env pull .env.local`).");
  const local = /localhost|127\.0\.0\.1/.test(url);
  return postgres(url, {
    ssl: local ? false : "require",
    // Supabase's transaction pooler (port 6543) doesn't support prepared statements.
    prepare: false,
    max: local ? 5 : 3,
    idle_timeout: 20,
    onnotice: () => {},
    // Keep `date` columns as plain yyyy-mm-dd strings (no timezone shifts).
    types: { date: { to: 1082, from: [1082], serialize: (x: string) => x, parse: (x: string) => x } },
  }) as unknown as ReturnType<typeof postgres>;
}

/** Tagged-template SQL. Reused across hot reloads and warm serverless invocations. */
export const sql: ReturnType<typeof postgres> = new Proxy((() => {}) as unknown as ReturnType<typeof postgres>, {
  get(_t, prop) {
    globalThis.__sql ??= client();
    return Reflect.get(globalThis.__sql, prop);
  },
  apply(_t, _this, args) {
    globalThis.__sql ??= client();
    return Reflect.apply(globalThis.__sql as unknown as (...a: unknown[]) => unknown, undefined, args);
  },
});

/** ISO string for a timestamptz/date value (postgres.js returns Date objects). */
export const iso = (v: unknown): string => (v instanceof Date ? v.toISOString() : String(v ?? ""));
/** null → undefined, so optional fields stay absent like before. */
export const opt = <T>(v: T | null): T | undefined => (v === null ? undefined : v);
/** numeric columns come back as strings. */
export const num = (v: unknown): number => Number(v);

/** Stable JSON for change detection (jsonb reorders object keys; [] ≡ null). */
export function sameKey(v: unknown): string {
  return JSON.stringify(v, (_k, x) => {
    if (Array.isArray(x)) return x.length ? x : null;
    if (x && typeof x === "object") {
      return Object.fromEntries(Object.entries(x).filter(([, y]) => y !== undefined).sort(([a], [b]) => a.localeCompare(b)));
    }
    return x;
  });
}
