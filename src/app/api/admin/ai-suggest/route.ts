import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isAdmin } from "@/lib/auth";

const MIME: Record<string, string> = {
  png: "image/png",
  webp: "image/webp",
  svg: "image/svg+xml",
  gif: "image/gif",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

async function toDataUri(imageUrl: string): Promise<string> {
  if (!imageUrl.startsWith("/")) return imageUrl; // already a URL / data URI
  const p = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
  const buf = await fs.readFile(p);
  const ext = imageUrl.split(".").pop()?.toLowerCase() ?? "jpg";
  return `data:${MIME[ext] ?? "image/jpeg"};base64,${buf.toString("base64")}`;
}

const PROMPT = `You are cataloguing a South Asian / Bengali clothing rental item from a photo.
Respond ONLY with a JSON object of this exact shape:
{"name": "short English name", "nameBn": "Bengali-script name", "category": "Saree | Suit | Lehenga | Accessories | ...", "color": "main colour", "description": "1-2 warm, sales-y sentences", "details": ["3-4 short tags like fabric, length, care"], "accent": "#RRGGBB vibrant hex matching the garment", "occasions": ["pujo", "biye", ...]}
If unsure about anything, make a sensible, confident guess.`;

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "Add GROQ_API_KEY to .env.local to enable AI auto-fill." },
      { status: 501 },
    );
  }

  const { imageUrl } = (await req.json().catch(() => ({}))) as { imageUrl?: string };
  if (!imageUrl) return NextResponse.json({ error: "No image provided." }, { status: 400 });

  let dataUri: string;
  try {
    dataUri = await toDataUri(imageUrl);
  } catch {
    return NextResponse.json({ error: "Could not read the image." }, { status: 400 });
  }

  const model = process.env.GROQ_VISION_MODEL || "meta-llama/llama-4-scout-17b-16e-instruct";
  try {
    const r = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model,
        temperature: 0.4,
        response_format: { type: "json_object" },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: PROMPT },
              { type: "image_url", image_url: { url: dataUri } },
            ],
          },
        ],
      }),
    });
    if (!r.ok) {
      const detail = (await r.text()).slice(0, 400);
      return NextResponse.json({ error: `Groq returned ${r.status}.`, detail }, { status: 502 });
    }
    const data = await r.json();
    const content = data?.choices?.[0]?.message?.content ?? "{}";
    let suggestion: unknown;
    try {
      suggestion = JSON.parse(content);
    } catch {
      suggestion = { raw: content };
    }
    return NextResponse.json({ ok: true, suggestion });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not reach Groq.", detail: String(err).slice(0, 200) },
      { status: 502 },
    );
  }
}
