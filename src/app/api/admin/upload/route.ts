import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { isOwnerOrAdmin } from "@/lib/ownerAuth";
import { blobEnabled, putImage } from "@/lib/blob";

const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

// Vercel serverless request bodies are capped at 4.5MB, so videos must stay
// under that to upload through this route; images get a more generous limit.
const MAX_BYTES = { image: 8 * 1024 * 1024, video: 4.5 * 1024 * 1024 };

export async function POST(req: Request) {
  if (!isOwnerOrAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json(
      { error: "Unsupported file type (images, or MP4/WebM video)." },
      { status: 400 },
    );
  }
  const kind = file.type.startsWith("video/") ? "video" : "image";
  if (file.size > MAX_BYTES[kind]) {
    const mb = kind === "video" ? "4.5MB" : "8MB";
    return NextResponse.json({ error: `${kind === "video" ? "Video" : "Image"} too large (max ${mb}).` }, { status: 400 });
  }

  const buf = Buffer.from(await file.arrayBuffer());
  const filename = `${randomUUID()}.${ext}`;
  const usingBlob = blobEnabled();
  try {
    if (usingBlob) {
      const url = await putImage(filename, buf, file.type);
      return NextResponse.json({ url });
    }
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), buf);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("[upload] save failed:", err);
    const detail = err instanceof Error ? err.message : String(err);
    const where = usingBlob
      ? "blob"
      : "no Blob token at runtime — redeploy after adding BLOB_READ_WRITE_TOKEN";
    return NextResponse.json(
      { error: `Couldn't save the file (${where}): ${detail}` },
      { status: 500 },
    );
  }
}
