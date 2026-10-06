import { NextResponse } from "next/server";
import { getItems } from "@/lib/store";
import { askGroq, fallbackPicks, type ChatMessage } from "@/lib/stylist";

// Best-effort per-visitor limit so the Groq key can't be drained by a script.
// In-memory, so it's per server instance — a deterrent, not a guarantee.
const WINDOW = 10 * 60_000;
const LIMIT = 30;
const hits = new Map<string, number[]>();
function limited(ip: string): boolean {
  const now = Date.now();
  const recent = (hits.get(ip) ?? []).filter((t) => now - t < WINDOW);
  recent.push(now);
  hits.set(ip, recent);
  if (hits.size > 5000) hits.clear(); // keep memory bounded
  return recent.length > LIMIT;
}

export async function POST(req: Request) {
  const ip = req.headers.get("x-forwarded-for")?.split(",")[0].trim() || "local";
  if (limited(ip)) {
    return NextResponse.json(
      { error: "You're asking quickly — give me a moment and try again." },
      { status: 429 },
    );
  }

  const body = await req.json().catch(() => null);
  const history: ChatMessage[] = (Array.isArray(body?.messages) ? body.messages : [])
    .filter(
      (m: { role?: unknown; content?: unknown }) =>
        (m?.role === "user" || m?.role === "assistant") && typeof m?.content === "string",
    )
    .map((m: ChatMessage) => ({ role: m.role, content: m.content.trim().slice(0, 600) }))
    .filter((m: ChatMessage) => m.content)
    .slice(-8);
  const last = history[history.length - 1];
  if (!last || last.role !== "user") {
    return NextResponse.json({ error: "Ask me something first." }, { status: 400 });
  }

  const items = await getItems();
  const viewing = typeof body?.itemId === "string" ? items.find((i) => i.id === body.itemId) : undefined;
  const result = (await askGroq(history, items, viewing)) ?? fallbackPicks(last.content, items, viewing);

  return NextResponse.json({
    reply: result.reply,
    ai: result.ai,
    picks: result.picks.flatMap(({ id, why }) => {
      const i = items.find((x) => x.id === id);
      return i ? [{ id: i.id, name: i.name, image: i.image, category: i.category, pricePerDay: i.pricePerDay, why }] : [];
    }),
  });
}
