"use client";

import { useState } from "react";
import { InviteShare } from "./InviteShare";

/** Name + email/phone → your personal invite link. */
export default function ReferForm({ welcomeOffer }: { welcomeOffer: number }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError("");
    const r = await fetch("/api/referrals", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, contact }),
    }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    setBusy(false);
    if (r?.ok && d.code) setCode(d.code);
    else setError(d?.error || "Couldn't create your link. Try again.");
  }

  if (code) {
    return (
      <div>
        <p className="text-sm text-cream">Your invite link</p>
        <p className="mt-1 text-xs text-cream/55">
          Use the same email or phone when you rent, so your credit finds you.
        </p>
        <InviteShare code={code} welcomeOffer={welcomeOffer} />
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow mb-1.5 block">Your name</span>
          <input className="field" value={name} onChange={(e) => setName(e.target.value)} placeholder="Jane Doe" required />
        </label>
        <label className="block">
          <span className="eyebrow mb-1.5 block">Email or phone</span>
          <input
            className="field"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="jane@email.com"
            required
          />
        </label>
      </div>
      <button type="submit" className="btn-primary" disabled={busy || !name.trim() || !contact.trim()}>
        {busy ? "Creating…" : "Get my link"}
      </button>
      {error && <p className="text-xs text-vermilion">{error}</p>}
    </form>
  );
}
