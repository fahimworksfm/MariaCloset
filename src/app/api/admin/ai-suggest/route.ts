import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { isOwnerOrAdmin } from "@/lib/ownerAuth";
import { visionModel } from "@/lib/ai";
import { parseModelJson } from "@/lib/aiJson";

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

const PROMPT = `You are cataloguing a South Asian clothing rental item from a photo.
Respond ONLY in English with a JSON object of this exact shape:
{"name": "short product name", "category": "Saree | Suit | Lehenga | Accessories | ...", "color": "main colour", "description": "1-2 warm, sales-y sentences", "details": ["3-4 short tags like fabric, length, care"], "accent": "#RRGGBB vibrant hex matching the garment", "occasions": ["weddings", "parties", ...]}
If unsure about anything, make a sensible, confident guess.`;

export async function POST(req: Request) {
  if (!isOwnerOrAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const key = process.env.GROQ_API_KEY;
  if (!key) {
    return NextResponse.json(
      { error: "AI auto-fill is off — add GROQ_API_KEY (in Vercel for the live site)." },
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

  const model = visionModel();
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
      return NextResponse.json(
        { error: `Groq returned ${r.status} for model "${model}".`, detail },
        { status: 502 },
      );
    }
    const data = await r.json();
    // Never report success with nothing filled in: if the answer can't be read, say so.
    const suggestion = parseModelJson(data?.choices?.[0]?.message?.content);
    if (!suggestion) {
      return NextResponse.json(
        { error: "The AI's answer couldn't be read — try again or use a clearer photo." },
        { status: 502 },
      );
    }
    return NextResponse.json({ ok: true, suggestion });
  } catch (err) {
    return NextResponse.json(
      { error: "Could not reach Groq.", detail: String(err).slice(0, 200) },
      { status: 502 },
    );
  }
}
