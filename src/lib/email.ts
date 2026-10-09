import { getSettings } from "@/lib/settings";

/** Sends mail via Resend when RESEND_API_KEY is set; otherwise a no-op. */
export function emailEnabled(): boolean {
  return !!process.env.RESEND_API_KEY;
}

/** Where new-request emails go: the Settings owner email, else OWNER_EMAIL. */
export async function ownerEmail(): Promise<string> {
  return (await getSettings()).site.ownerEmail || process.env.OWNER_EMAIL || "";
}

export function looksLikeEmail(s: string): boolean {
  return /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(s.trim());
}

export async function sendEmail(opts: {
  to: string;
  subject: string;
  html: string;
}): Promise<boolean> {
  const key = process.env.RESEND_API_KEY;
  if (!key || !opts.to) return false;
  const from = process.env.RESEND_FROM || "Maria's Closet <onboarding@resend.dev>";
  try {
    const r = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from, to: [opts.to], subject: opts.subject, html: opts.html }),
    });
    if (!r.ok) {
      console.error("[email] resend", r.status, (await r.text()).slice(0, 200));
      return false;
    }
    return true;
  } catch (err) {
    console.error("[email] failed:", err);
    return false;
  }
}
