import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { isAdmin } from "@/lib/auth";

const MIME: Record<string, string> = {
  png: "image/png",
  webp: "image/webp",
  jpg: "image/jpeg",
  jpeg: "image/jpeg",
};

async function readLocal(imageUrl: string): Promise<{ buf: Buffer; dataUri: string }> {
  const p = path.join(process.cwd(), "public", imageUrl.replace(/^\//, ""));
  const buf = await fs.readFile(p);
  const ext = imageUrl.split(".").pop()?.toLowerCase() ?? "jpg";
  return { buf, dataUri: `data:${MIME[ext] ?? "image/jpeg"};base64,${buf.toString("base64")}` };
}

async function savePng(buf: Buffer): Promise<string> {
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const name = `${randomUUID()}.png`;
  await fs.writeFile(path.join(dir, name), buf);
  return `/uploads/${name}`;
}

// Background removal (keeps the person + clothes) via remove.bg
async function removeBackground(buf: Buffer): Promise<Buffer> {
  const key = process.env.REMOVEBG_API_KEY!;
  const form = new FormData();
  form.append("image_file", new Blob([new Uint8Array(buf)]), "image.png");
  form.append("size", "auto");
  const r = await fetch("https://api.remove.bg/v1.0/removebg", {
    method: "POST",
    headers: { "X-Api-Key": key },
    body: form,
  });
  if (!r.ok) throw new Error(`remove.bg ${r.status}: ${(await r.text()).slice(0, 200)}`);
  return Buffer.from(await r.arrayBuffer());
}

// Garment-only extraction via a Replicate clothes-segmentation model.
async function extractGarment(dataUri: string): Promise<Buffer> {
  const token = process.env.REPLICATE_API_TOKEN!;
  const version = process.env.REPLICATE_CLOTHES_MODEL;
  if (!version) throw new Error("Set REPLICATE_CLOTHES_MODEL to a segmentation model version.");
  const create = await fetch("https://api.replicate.com/v1/predictions", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ version, input: { image: dataUri } }),
  });
  if (!create.ok) throw new Error(`replicate ${create.status}: ${(await create.text()).slice(0, 200)}`);
  let pred = await create.json();
  for (let i = 0; i < 30 && (pred.status === "starting" || pred.status === "processing"); i++) {
    await new Promise((res) => setTimeout(res, 1500));
    const poll = await fetch(pred.urls.get, { headers: { Authorization: `Bearer ${token}` } });
    pred = await poll.json();
  }
  if (pred.status !== "succeeded") throw new Error(`replicate status: ${pred.status}`);
  const out = Array.isArray(pred.output) ? pred.output[0] : pred.output;
  const img = await fetch(out);
  return Buffer.from(await img.arrayBuffer());
}

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const { imageUrl, mode } = (await req.json().catch(() => ({}))) as {
    imageUrl?: string;
    mode?: "background" | "garment";
  };
  if (!imageUrl?.startsWith("/uploads/")) {
    return NextResponse.json({ error: "Upload an image first." }, { status: 400 });
  }

  const wantsGarment = mode === "garment";
  if (wantsGarment && !process.env.REPLICATE_API_TOKEN) {
    return NextResponse.json(
      { error: "Garment extraction needs REPLICATE_API_TOKEN + REPLICATE_CLOTHES_MODEL." },
      { status: 501 },
    );
  }
  if (!wantsGarment && !process.env.REMOVEBG_API_KEY) {
    return NextResponse.json(
      { error: "Background removal needs REMOVEBG_API_KEY." },
      { status: 501 },
    );
  }

  try {
    const { buf, dataUri } = await readLocal(imageUrl);
    const result = wantsGarment ? await extractGarment(dataUri) : await removeBackground(buf);
    const url = await savePng(result);
    return NextResponse.json({ ok: true, url });
  } catch (err) {
    return NextResponse.json({ error: String(err).slice(0, 300) }, { status: 502 });
  }
}
