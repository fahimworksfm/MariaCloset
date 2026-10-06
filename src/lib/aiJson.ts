/**
 * Pull the JSON object out of a model reply. Even in JSON mode some models
 * wrap it in ```json fences or prepend <think>…</think> reasoning (Qwen does),
 * so strip those and take the outermost {...}. Returns null if nothing parses.
 */
export function parseModelJson(content: unknown): Record<string, unknown> | null {
  if (typeof content !== "string") return null;
  const text = content
    .replace(/<think>[\s\S]*?<\/think>/gi, "")
    .replace(/```(?:json)?/gi, "")
    .trim();
  const start = text.indexOf("{");
  const end = text.lastIndexOf("}");
  if (start < 0 || end <= start) return null;
  try {
    const parsed = JSON.parse(text.slice(start, end + 1));
    return parsed && typeof parsed === "object" && !Array.isArray(parsed) ? parsed : null;
  } catch {
    return null;
  }
}
