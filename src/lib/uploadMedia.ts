// Client helper: upload a file straight to Supabase Storage via a signed URL.
export type UploadResult = { url: string } | { error: string };

export async function uploadMedia(
  file: File,
  folder: "items" | "lookbook" | "site" = "items",
): Promise<UploadResult> {
  const r = await fetch("/api/admin/upload", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contentType: file.type, size: file.size, folder }),
  }).catch(() => null);
  const d = await r?.json().catch(() => ({}));
  if (!r?.ok) return { error: d?.error || "Upload failed" };

  if (d.local) {
    // Local dev without Supabase: the API saves the file itself.
    const form = new FormData();
    form.append("file", file);
    const l = await fetch("/api/admin/upload", { method: "POST", body: form }).catch(() => null);
    const ld = await l?.json().catch(() => ({}));
    return l?.ok && ld.url ? { url: ld.url } : { error: ld?.error || "Upload failed" };
  }

  const put = await fetch(d.uploadUrl, {
    method: "PUT",
    headers: { "Content-Type": file.type, "x-upsert": "false" },
    body: file,
  }).catch(() => null);
  if (!put?.ok) {
    const msg = await put?.text().catch(() => "");
    return { error: `Upload failed${msg ? `: ${msg.slice(0, 120)}` : ""}` };
  }
  return { url: d.url };
}
