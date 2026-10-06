// Server-only: the Groq models every AI feature uses, and a health check for
// the admin. One place for the defaults, so the check and the features agree.

// Defaults track Groq's current line-up. Llama 4 Scout (the old vision model)
// was shut down on 17 Jul 2026; Qwen3.8 27B is Groq's multimodal replacement
// (a preview model — if Groq retires it, the admin status line will say so).
const TEXT_DEFAULT = "llama-3.3-70b-versatile";
const VISION_DEFAULT = "qwen/qwen3.8-27b";

/** Text model — AI search and the stylist. */
export const textModel = () => process.env.GROQ_MODEL || TEXT_DEFAULT;
/** Vision model — photo auto-fill in the piece editor (needs image input). */
export const visionModel = () => process.env.GROQ_VISION_MODEL || VISION_DEFAULT;

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
    // A model set by env var overrides the default, so name both the culprit and the fix.
    const fix = (envVar: string, fallback: string) =>
      process.env[envVar]
        ? `Delete ${envVar} in Vercel (to use ${fallback}) or set it to a current model, then redeploy.`
        : `Groq may have retired ${fallback} — tell your developer the default needs updating.`;
    if (!ids.has(text)) {
      return {
        state: "error",
        text: `Groq doesn't offer the model "${text}".`,
        detail: `${fix("GROQ_MODEL", TEXT_DEFAULT)} ${fallbacks}`,
      };
    }
    if (!ids.has(vision)) {
      return {
        state: "warn",
        text: `AI connected · ${text}`,
        detail: `Photo auto-fill's model "${vision}" isn't available. ${fix("GROQ_VISION_MODEL", VISION_DEFAULT)}`,
      };
    }
    return { state: "ok", text: `AI connected · ${text} · photos: ${vision}` };
  } catch {
    return { state: "error", text: "Couldn't reach Groq.", detail: fallbacks };
  }
}
