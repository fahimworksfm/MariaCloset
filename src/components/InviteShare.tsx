"use client";

import { useState } from "react";
import { money } from "@/data/config";

/** Shows someone's invite link with copy + (where supported) native share. */
export function InviteShare({ code, welcomeOffer }: { code: string; welcomeOffer: number }) {
  const [copied, setCopied] = useState(false);
  const link = typeof window === "undefined" ? `/?ref=${code}` : `${window.location.origin}/?ref=${code}`;
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  async function copy() {
    try {
      await navigator.clipboard.writeText(link);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      /* clipboard blocked — the link is still visible to copy by hand */
    }
  }

  return (
    <div className="mt-3">
      <div className="flex items-center gap-2 rounded-lg border border-cream/15 bg-white/[0.02] px-3 py-2.5">
        <span className="min-w-0 flex-1 truncate text-sm text-cream" title={link}>
          {link}
        </span>
        <span className="shrink-0 font-mono text-xs tracking-wider text-cream/45">{code}</span>
      </div>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={copy} className="btn-primary">
          {copied ? "Copied" : "Copy link"}
        </button>
        {canShare && (
          <button
            type="button"
            className="btn-ghost"
            onClick={() =>
              navigator
                .share({
                  title: "Maria's Closet",
                  text: `Borrow something beautiful — ${money(welcomeOffer)} off your first rental.`,
                  url: link,
                })
                .catch(() => {})
            }
          >
            Share
          </button>
        )}
      </div>
    </div>
  );
}

/** Fetches the invite link for someone we already know (e.g. right after a request). */
export function InviteButton({
  name,
  contact,
  welcomeOffer,
}: {
  name: string;
  contact: string;
  welcomeOffer: number;
}) {
  const [code, setCode] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function get() {
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

  if (code) return <InviteShare code={code} welcomeOffer={welcomeOffer} />;
  return (
    <div className="mt-3">
      <button type="button" onClick={get} disabled={busy} className="btn-ghost">
        {busy ? "Creating…" : "Get my invite link"}
      </button>
      {error && <p className="mt-2 text-xs text-vermilion">{error}</p>}
    </div>
  );
}
