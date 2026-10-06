// Server-only: the Groq models every AI feature uses, and a health check for
// the admin. One place for the defaults, so the check and the features agree.

/** Text model — AI search and the stylist. */
export const textModel = () => process.env.GROQ_MODEL || "llama-3.3-70b-versatile";
/** Vision model — photo auto-fill in the piece editor. */
export const visionModel = () =>
  process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";

export type AiStatus = {
  state: "ok" | "warn" | "error" | "off";
  text: string;
  detail?: string;
};

const TTL = 5 * 60_000;
let cache: { at: number; value: AiStatus } | null = null;

/**
 * Is Groq usable right now? Lists Groq's models (no tokens spent) to catch a
 * missing/rejected key or a model Groq no longer offers. Cached for 5 minutes;
 * a new deployment starts fresh, so fixes show up right after redeploying.
 */
export async function getAiStatus(): Promise<AiStatus> {
  if (cache && Date.now() - cache.at < TTL) return cache.value;
  const value = await check();
  cache = { at: Date.now(), value };
  return value;
}

async function check(): Promise<AiStatus> {
  const key = process.env.GROQ_API_KEY;
  const text = textModel();
  const vision = visionModel();
  const fallbacks = "Search, the stylist and photo auto-fill are using their non-AI fallbacks.";
  if (!key) return { state: "off", text: "AI is off — no GROQ_API_KEY is set.", detail: fallbacks };

  try {
    const r = await fetch("https://api.groq.com/openai/v1/models", {
      headers: { Authorization: `Bearer ${key}` },
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (r.status === 401 || r.status === 403) {
      return {
        state: "error",
        text: `Groq rejected the API key (${r.status}).`,
        detail: `Check GROQ_API_KEY in Vercel, then redeploy. ${fallbacks}`,
      };
    }
    if (!r.ok) return { state: "error", text: `Groq returned an error (${r.status}).`, detail: fallbacks };

    const ids = new Set<string>(((await r.json())?.data ?? []).map((m: { id?: string }) => m.id));
    if (!ids.has(text)) {
      return {
        state: "error",
        text: `Groq doesn't offer the model "${text}".`,
        detail: `Set GROQ_MODEL to a current Groq model (or remove it to use the default), then redeploy. ${fallbacks}`,
      };
    }
    if (!ids.has(vision)) {
      return {
        state: "warn",
        text: `AI connected · ${text}`,
        detail: `Photo auto-fill's model "${vision}" isn't available — set GROQ_VISION_MODEL to a current vision model.`,
      };
    }
    return { state: "ok", text: `AI connected · ${text}` };
  } catch {
    return { state: "error", text: "Couldn't reach Groq.", detail: fallbacks };
  }
}
