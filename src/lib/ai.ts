// Server-only: the Groq models and key every AI feature uses, and a health
// check for the admin. One place for all of it, so the check and the features agree.

// Defaults track Groq's current line-up. Llama 4 Scout (the old vision model)
// was shut down on 17 Jul 2026; Qwen3.8 27B is Groq's multimodal replacement
// (a preview model — if Groq retires it, the admin status line will say so).
const TEXT_DEFAULT = "llama-3.3-70b-versatile";
const VISION_DEFAULT = "qwen/qwen3.8-27b";

export const GROQ_CHAT_URL = "https://api.groq.com/openai/v1/chat/completions";

/** The API key, trimmed: a space or line break pasted along with it breaks the auth header. */
export const groqKey = () => process.env.GROQ_API_KEY?.trim() || "";
/** Text model — AI search and the stylist. */
export const textModel = () => process.env.GROQ_MODEL?.trim() || TEXT_DEFAULT;
/** Vision model — photo auto-fill in the piece editor (needs image input). */
export const visionModel = () => process.env.GROQ_VISION_MODEL?.trim() || VISION_DEFAULT;

export type AiStatus = {
  state: "ok" | "warn" | "error" | "off";
  text: string;
  detail?: string;
};

const TTL = 5 * 60_000;
let cache: { at: number; value: AiStatus } | null = null;

/**
 * Is Groq usable right now? Checks the key and models against Groq's model
 * list, then sends a 1-token test request so problems only a real call would
 * hit (account limits, access) show up too, with Groq's own message. Cached
 * for 5 minutes; a new deployment starts fresh.
 */
export async function getAiStatus(): Promise<AiStatus> {
  if (cache && Date.now() - cache.at < TTL) return cache.value;
  const value = await check();
  cache = { at: Date.now(), value };
  return value;
}

/** Groq's error message, e.g. {"error":{"message":"Invalid API Key"}}. */
async function groqMessage(r: Response): Promise<string> {
  try {
    const body = await r.json();
    return String(body?.error?.message ?? "").slice(0, 160);
  } catch {
    return "";
  }
}

async function check(): Promise<AiStatus> {
  const key = groqKey();
  const text = textModel();
  const vision = visionModel();
  const fallbacks = "Search, the stylist and photo auto-fill are using their non-AI fallbacks.";
  if (!key) return { state: "off", text: "AI is off — no GROQ_API_KEY is set.", detail: fallbacks };
  const headers = { Authorization: `Bearer ${key}`, "Content-Type": "application/json" };
  // Groq keys start with "gsk_" — a different value usually means the wrong thing was pasted.
  const shape = key.startsWith("gsk_") ? "" : " The value doesn't look like a Groq key (those start with gsk_).";

  try {
    const r = await fetch("https://api.groq.com/openai/v1/models", {
      headers,
      cache: "no-store",
      signal: AbortSignal.timeout(8_000),
    });
    if (r.status === 401 || r.status === 403) {
      return {
        state: "error",
        text: `Groq rejected the API key (${r.status}).`,
        detail: `${await groqMessage(r)}${shape} Replace GROQ_API_KEY in Vercel, then redeploy. ${fallbacks}`.trim(),
      };
    }
    if (!r.ok) {
      return { state: "error", text: `Groq returned an error (${r.status}).`, detail: `${await groqMessage(r)} ${fallbacks}`.trim() };
    }

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

    // A real (1-token) request: catches account limits or access problems.
    const c = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers,
      body: JSON.stringify({ model: text, max_tokens: 1, messages: [{ role: "user", content: "ping" }] }),
      cache: "no-store",
      signal: AbortSignal.timeout(10_000),
    });
    if (!c.ok) {
      return {
        state: "error",
        text: `Groq refused a test request (${c.status}).`,
        detail: `${await groqMessage(c)} ${fallbacks}`.trim(),
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
  } catch (err) {
    const why = err instanceof Error ? err.name : "network error";
    return { state: "error", text: `Couldn't reach Groq (${why}).`, detail: fallbacks };
  }
}
