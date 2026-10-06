import { NextResponse } from "next/server";
import { GROQ_CHAT_URL, groqKey, textModel } from "@/lib/ai";
import { parseModelJson } from "@/lib/aiJson";

export async function POST(req: Request) {
  const { query, categories, occasions } = (await req.json().catch(() => ({}))) as {
    query?: string;
    categories?: string[];
    occasions?: string[];
  };
  if (!query?.trim()) return NextResponse.json({ error: "Empty query." }, { status: 400 });

  const key = groqKey();
  // Graceful fallback: treat the text as a plain keyword search.
  if (!key) return NextResponse.json({ ok: true, filters: { q: query }, ai: false });

  const model = textModel();
  const prompt = `Convert a shopper's request into filters for a South Asian clothing rental catalogue.
Available categories: ${(categories ?? []).join(", ") || "any"}.
Available occasions: ${(occasions ?? []).join(", ") || "any"}.
Respond ONLY with JSON of this shape:
{"category": <one of the categories, or null>, "occasion": <one of the occasions, or null>, "priceMax": <number or null>, "q": <free-text keywords like a colour or fabric, or null>}
Request: "${query}"`;

  try {
    const r = await fetch(GROQ_CHAT_URL, {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [{ role: "user", content: prompt }],
      }),
    });
    if (!r.ok) {
      console.error("[search] groq", r.status, (await r.text()).slice(0, 300));
      return NextResponse.json({ ok: true, filters: { q: query }, ai: false });
    }
    const data = await r.json();
    const filters = parseModelJson(data?.choices?.[0]?.message?.content);
    if (!filters) return NextResponse.json({ ok: true, filters: { q: query }, ai: false });
    return NextResponse.json({ ok: true, filters, ai: true });
  } catch {
    return NextResponse.json({ ok: true, filters: { q: query }, ai: false });
  }
}
