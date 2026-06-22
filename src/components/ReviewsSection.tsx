"use client";

import { useState } from "react";
import type { Review } from "@/lib/types";

function Stars({ n, className = "" }: { n: number; className?: string }) {
  return (
    <span className={`text-gold ${className}`}>
      {"★".repeat(Math.round(n))}
      <span className="text-gold/25">{"★".repeat(5 - Math.round(n))}</span>
    </span>
  );
}

export default function ReviewsSection({
  itemId,
  reviews,
}: {
  itemId: string;
  reviews: Review[];
}) {
  const [name, setName] = useState("");
  const [rating, setRating] = useState(5);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");

  const avg = reviews.length ? reviews.reduce((s, r) => s + r.rating, 0) / reviews.length : 0;

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!name.trim() || !text.trim()) return;
    setStatus("sending");
    const r = await fetch("/api/reviews", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ itemId, name, rating, text }),
    });
    setStatus(r.ok ? "done" : "error");
  }

  return (
    <section className="mt-16">
      <div className="flex flex-wrap items-baseline gap-3">
        <h2 className="font-display text-3xl text-gold">Reviews</h2>
        {reviews.length > 0 && (
          <span className="text-sm text-cream/70">
            <Stars n={avg} /> {avg.toFixed(1)} · {reviews.length} review
            {reviews.length > 1 ? "s" : ""}
          </span>
        )}
      </div>

      {reviews.length > 0 && (
        <div className="mt-5 grid gap-3 sm:grid-cols-2">
          {reviews.map((r) => (
            <div key={r.id} className="panel p-4">
              <div className="flex items-center gap-2">
                <Stars n={r.rating} />
                <span className="font-display text-cream">{r.name}</span>
              </div>
              <p className="mt-1 text-sm text-cream/75">{r.text}</p>
            </div>
          ))}
        </div>
      )}

      <div className="panel mt-6 p-5">
        {status === "done" ? (
          <p className="text-emerald">✓ Thanks! Your review will appear once approved.</p>
        ) : (
          <form onSubmit={submit} className="space-y-3">
            <p className="eyebrow">Worn it? Leave a review</p>
            <div className="flex flex-wrap items-center gap-3">
              <input
                className="field max-w-[220px]"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
              <div className="flex items-center gap-1 text-2xl">
                {[1, 2, 3, 4, 5].map((n) => (
                  <button
                    key={n}
                    type="button"
                    onClick={() => setRating(n)}
                    className={n <= rating ? "text-gold" : "text-gold/25"}
                    aria-label={`${n} stars`}
                  >
                    ★
                  </button>
                ))}
              </div>
            </div>
            <textarea
              className="field min-h-[70px]"
              value={text}
              onChange={(e) => setText(e.target.value)}
              placeholder="How was it? What was the occasion?"
            />
            <div className="flex items-center gap-3">
              <button type="submit" className="btn-primary" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Post review"}
              </button>
              {status === "error" && <span className="text-sm text-vermilion">Try again.</span>}
            </div>
          </form>
        )}
      </div>
    </section>
  );
}
