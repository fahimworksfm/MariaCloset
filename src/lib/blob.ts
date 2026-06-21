// Server-only. Vercel Blob storage with a graceful local-filesystem fallback.
import { put, list } from "@vercel/blob";

/** True when a Blob store is connected (token auto-injected on Vercel). */
export function blobEnabled(): boolean {
  return !!process.env.BLOB_READ_WRITE_TOKEN;
}

/** Upload an image buffer to Blob; returns its public URL. */
export async function putImage(
  filename: string,
  data: Buffer,
  contentType: string,
): Promise<string> {
  const { url } = await put(`uploads/${filename}`, data, {
    access: "public",
    contentType,
    addRandomSuffix: false,
  });
  return url;
}

/** Read a JSON document stored at a stable pathname (or return the fallback). */
export async function getJson<T>(pathname: string, fallback: T): Promise<T> {
  try {
    const { blobs } = await list({ prefix: pathname, limit: 1 });
    const hit = blobs.find((b) => b.pathname === pathname);
    if (!hit) return fallback;
    const res = await fetch(hit.url, { cache: "no-store" });
    if (!res.ok) return fallback;
    return (await res.json()) as T;
  } catch (err) {
    console.error("[blob] getJson failed:", err);
    return fallback;
  }
}

/** Write a JSON document at a stable pathname (overwrites in place). */
export async function putJson(pathname: string, data: unknown): Promise<boolean> {
  try {
    await put(pathname, JSON.stringify(data, null, 2), {
      access: "public",
      contentType: "application/json",
      addRandomSuffix: false,
      allowOverwrite: true,
      cacheControlMaxAge: 0,
    });
    return true;
  } catch (err) {
    console.error("[blob] putJson failed:", err);
    return false;
  }
}
