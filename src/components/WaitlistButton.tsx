"use client";

import { useState } from "react";

export default function WaitlistButton({ itemId }: { itemId: string }) {
  const [open, setOpen] = useState(false);
  const [contact, setContact] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!contact.trim()) return;
    setStatus("sending");
    const r = await fetch("/api/waitlist", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, contact }),
    });
    setStatus(r.ok ? "done" : "error");
  }

  if (status === "done") {
    return <p className="text-sm text-emerald">✓ We&apos;ll let you know when it&apos;s free.</p>;
  }
  if (!open) {
    return (
      <button
        onClick={() => setOpen(true)}
        className="text-sm text-gold/80 underline transition hover:text-gold"
      >
        Notify me when available
      </button>
    );
  }
  return (
    <form onSubmit={submit} className="flex gap-2">
      <input
        className="field"
        value={contact}
        onChange={(e) => setContact(e.target.value)}
        placeholder="email or phone"
        autoFocus
      />
      <button type="submit" className="btn-ghost whitespace-nowrap" disabled={status === "sending"}>
        {status === "sending" ? "…" : "Notify me"}
      </button>
      {status === "error" && <span className="self-center text-sm text-vermilion">try again</span>}
    </form>
  );
}
