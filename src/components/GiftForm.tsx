"use client";

import { useState } from "react";
import { money, siteConfig } from "@/data/config";

type Card = { code: string; amount: number; from: string; to: string; message?: string };

export default function GiftForm() {
  const [from, setFrom] = useState("");
  const [to, setTo] = useState("");
  const [amount, setAmount] = useState("");
  const [message, setMessage] = useState("");
  const [card, setCard] = useState<Card | null>(null);
  const [status, setStatus] = useState<"idle" | "sending" | "error">("idle");
  const [copied, setCopied] = useState(false);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!from.trim() || !to.trim() || !(Number(amount) > 0)) return;
    setStatus("sending");
    const r = await fetch("/api/gift", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ from, to, amount: Number(amount), message }),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok && d.card) {
      setCard(d.card);
      setStatus("idle");
    } else setStatus("error");
  }

  if (card) {
    return (
      <div className="panel p-6 text-center">
        <p className="eyebrow">A gift for {card.to}</p>
        <p className="mt-2 font-display text-5xl text-gold-shimmer">{money(card.amount)}</p>
        {card.message && <p className="mt-2 text-cream/70">“{card.message}”</p>}
        <p className="mt-5 text-sm text-cream/55">Gift code</p>
        <div className="mt-1 flex items-center justify-center gap-2">
          <code className="rounded-lg border border-gold/30 bg-night/50 px-4 py-2 font-mono text-lg text-gold">
            {card.code}
          </code>
          <button
            onClick={() => {
              navigator.clipboard.writeText(card.code);
              setCopied(true);
              setTimeout(() => setCopied(false), 1500);
            }}
            className="btn-ghost px-4 py-2 text-xs"
          >
            {copied ? "Copied ✓" : "Copy"}
          </button>
        </div>
        <p className="mx-auto mt-4 max-w-sm text-xs text-cream/50">
          Share this code with {card.to}. They add it to their rental note and {siteConfig.ownerName}{" "}
          applies the credit.
        </p>
        <button onClick={() => setCard(null)} className="btn-ghost mt-5">
          Create another
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="panel space-y-3 p-6">
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow mb-1 block">From</span>
          <input className="field" value={from} onChange={(e) => setFrom(e.target.value)} placeholder="Your name" />
        </label>
        <label className="block">
          <span className="eyebrow mb-1 block">To</span>
          <input className="field" value={to} onChange={(e) => setTo(e.target.value)} placeholder="Recipient" />
        </label>
      </div>
      <label className="block">
        <span className="eyebrow mb-1 block">Amount ($)</span>
        <input
          type="number"
          className="field"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          placeholder="50"
        />
      </label>
      <label className="block">
        <span className="eyebrow mb-1 block">Message (optional)</span>
        <textarea
          className="field min-h-[70px]"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="Happy birthday — pick something gorgeous!"
        />
      </label>
      <button type="submit" className="btn-primary" disabled={status === "sending"}>
        {status === "sending" ? "Creating…" : "Create gift card"}
      </button>
      {status === "error" && <p className="text-sm text-vermilion">Couldn&apos;t create it — try again.</p>}
    </form>
  );
}
