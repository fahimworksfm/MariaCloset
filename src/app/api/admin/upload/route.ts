import { NextResponse } from "next/server";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";
import { isOwnerOrAdmin } from "@/lib/ownerAuth";
import { mediaEnabled, signUpload } from "@/lib/media";

const ALLOWED: Record<string, string> = {
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
  "image/svg+xml": "svg",
  "image/gif": "gif",
  "video/mp4": "mp4",
  "video/webm": "webm",
};

// Files go browser → Supabase directly, so only the bucket's cap applies.
const MAX_BYTES = { image: 20 * 1024 * 1024, video: 50 * 1024 * 1024 };

function check(type: string, size: number): { ext: string } | { error: string } {
  const ext = ALLOWED[type];
  if (!ext) return { error: "Unsupported file type (images, or MP4/WebM video)." };
  const kind = type.startsWith("video/") ? "video" : "image";
  if (size > MAX_BYTES[kind]) {
    return { error: `${kind === "video" ? "Video" : "Image"} too large (max ${kind === "video" ? "50" : "20"}MB).` };
  }
  return { ext };
}

/**
 * JSON { contentType, size, folder? } → { uploadUrl, url }: the browser then
 * PUTs the file to uploadUrl. Without Supabase configured (local dev only), the
 * response is { local: true } and the browser posts the file here as a form.
 */
export async function POST(req: Request) {
  if (!isOwnerOrAdmin()) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  if (req.headers.get("content-type")?.includes("application/json")) {
    const body = await req.json().catch(() => ({}));
    const ok = check(String(body.contentType ?? ""), Number(body.size) || 0);
    if ("error" in ok) return NextResponse.json(ok, { status: 400 });
    if (!mediaEnabled()) {
      if (process.env.NODE_ENV === "production") {
        return NextResponse.json({ error: "Storage isn't configured on this deployment." }, { status: 500 });
      }
      return NextResponse.json({ local: true });
    }
    const folder = ["items", "lookbook", "site"].includes(body.folder) ? body.folder : "items";
    try {
      return NextResponse.json(await signUpload(`${folder}/${randomUUID()}.${ok.ext}`));
    } catch (err) {
      console.error("[upload] sign failed:", err);
      return NextResponse.json({ error: `Couldn't start the upload: ${(err as Error).message}` }, { status: 500 });
    }
  }

  // Local-dev fallback: save under public/uploads.
  if (mediaEnabled() || process.env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Upload directly to storage." }, { status: 400 });
  }
  const form = await req.formData().catch(() => null);
  const file = form?.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "No file uploaded." }, { status: 400 });
  const ok = check(file.type, file.size);
  if ("error" in ok) return NextResponse.json(ok, { status: 400 });
  const filename = `${randomUUID()}.${ok.ext}`;
  const dir = path.join(process.cwd(), "public", "uploads");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, filename), Buffer.from(await file.arrayBuffer()));
  return NextResponse.json({ url: `/uploads/${filename}` });
}
