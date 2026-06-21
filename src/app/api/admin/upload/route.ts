import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { isAdmin } from "@/lib/auth";
import { blobEnabled, putImage } from "@/lib/blob";

const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
};

export async function POST(req: Request) {
  if (!isAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

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
  try {
    if (blobEnabled()) {
      const url = await putImage(filename, buf, file.type);
      return NextResponse.json({ url });
    }
    const dir = path.join(process.cwd(), "public", "uploads");
    await fs.mkdir(dir, { recursive: true });
    await fs.writeFile(path.join(dir, filename), buf);
    return NextResponse.json({ url: `/uploads/${filename}` });
  } catch (err) {
    console.error("[upload] save failed:", err);
    return NextResponse.json(
      {
        error:
          "Couldn't save the image. On a hosted (read-only) server, create a Vercel Blob store to enable uploads.",
      },
      { status: 500 },
    );
  }
}
