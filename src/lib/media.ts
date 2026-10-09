// Server-only. Supabase Storage: a public "media" bucket. The browser uploads
// straight to Supabase with a short-lived signed URL we mint after checking the
// admin/owner cookie — so files never pass through (or are capped by) our API.
import { createClient, type SupabaseClient } from "@supabase/supabase-js";

export const MEDIA_BUCKET = "media";

function creds() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.SUPABASE_SECRET_KEY;
  return url && key ? { url, key } : null;
}

export function mediaEnabled(): boolean {
  return !!creds();
}

let client: SupabaseClient | null = null;
function storage() {
  const c = creds();
  if (!c) throw new Error("Supabase Storage isn't configured (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY).");
  client ??= createClient(c.url, c.key, { auth: { persistSession: false, autoRefreshToken: false } });
  return client.storage.from(MEDIA_BUCKET);
}

/** A one-time upload URL for `path`, plus where the file will be publicly served. */
export async function signUpload(path: string): Promise<{ uploadUrl: string; url: string }> {
  const bucket = storage();
  const { data, error } = await bucket.createSignedUploadUrl(path);
  if (error || !data) throw new Error(error?.message || "Couldn't sign the upload.");
  return { uploadUrl: data.signedUrl, url: bucket.getPublicUrl(path).data.publicUrl };
}
