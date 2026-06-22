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
};

export async function POST(req: Request) {
  if (!isOwnerOrAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) {
    return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  }
  const ext = ALLOWED[file.type];
  if (!ext) {
    return NextResponse.json({ error: "Unsupported image type." }, { status: 400 });
  }
  if (file.size > 8 * 1024 * 1024) {
    return NextResponse.json({ error: "Image too large (max 8MB)." }, { status: 400 });
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
      { error: `Couldn't save the image (${where}): ${detail}` },
      { status: 500 },
    );
  }
}
