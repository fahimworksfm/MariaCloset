// Browser-only helpers for the invite code a visitor arrived with.

const KEY = "mc_ref";
const TTL = 30 * 86_400_000; // an invite is honoured for 30 days

/** Remember ?ref=CODE. First invite wins until it expires. */
export function captureInvite(search: string) {
  const code = new URLSearchParams(search).get("ref")?.trim().toUpperCase();
  if (!code || !/^[A-Z0-9-]{4,24}$/.test(code)) return;
  try {
    const cur = JSON.parse(localStorage.getItem(KEY) || "null") as { code: string; at: number } | null;
    if (cur && Date.now() - cur.at < TTL) return;
    localStorage.setItem(KEY, JSON.stringify({ code, at: Date.now() }));
  } catch {
    /* storage unavailable — the invite just isn't remembered */
  }
}

export function readInvite(): string | null {
  try {
    const cur = JSON.parse(localStorage.getItem(KEY) || "null") as { code: string; at: number } | null;
    return cur && Date.now() - cur.at < TTL ? cur.code : null;
  } catch {
    return null;
  }
}
