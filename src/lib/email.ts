import { siteConfig } from "@/data/config";

/** Sends mail via Resend when RESEND_API_KEY is set; otherwise a no-op. */
export function emailEnabled(): boolean {
  return !!process.env.RESEND_API_KEY;
}

export function ownerEmail(): string {
  return process.env.OWNER_EMAIL || siteConfig.ownerEmail || "";
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
