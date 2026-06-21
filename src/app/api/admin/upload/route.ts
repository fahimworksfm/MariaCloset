import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { isAdmin } from "@/lib/auth";

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
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  const filename = `${randomUUID()}.${ext}`;
  await fs.writeFile(path.join(dir, filename), buf);

  return NextResponse.json({ url: `/uploads/${filename}` });
}
