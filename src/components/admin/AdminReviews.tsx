"use client";

import { useEffect, useState } from "react";
import type { Review } from "@/lib/types";
import AdminNav from "./AdminNav";

function Stars({ n }: { n: number }) {
  return (
    <span className="text-gold">
      {"★".repeat(n)}
      <span className="text-gold/30">{"★".repeat(5 - n)}</span>
    </span>
  );
}

export default function AdminReviews({ initial }: { initial: Review[] }) {
  const [reviews, setReviews] = useState(initial);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 3000);
    return () => clearTimeout(t);
  }, [msg]);

  async function approve(id: string, approved: boolean) {
    const r = await fetch("/api/admin/reviews", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, approved }),
    });
    if (r.ok) {
      setReviews((prev) => prev.map((x) => (x.id === id ? { ...x, approved } : x)));
      setMsg(approved ? "Published ✓" : "Hidden");
    } else setMsg("Couldn't update");
  }

  async function del(id: string) {
    if (!confirm("Delete this review?")) return;
    const r = await fetch(`/api/admin/reviews?id=${id}`, { method: "DELETE" });
    if (r.ok) setReviews((prev) => prev.filter((x) => x.id !== id));
  }

  const pending = reviews.filter((r) => !r.approved).length;

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-gold-shimmer">Reviews</h1>
          <p className="text-sm text-cream/60">
            Approve a review to show it on the piece&apos;s page. {pending} awaiting you.
          </p>
        </div>
        <AdminNav active="reviews" />
      </header>

      {msg && (
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">
          {msg}
        </div>
      )}

      {reviews.length === 0 ? (
        <p className="py-16 text-center text-cream/60">No reviews yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {reviews.map((r) => (
            <div key={r.id} className="panel flex flex-wrap items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <Stars n={r.rating} />
                  <span className="font-display text-lg text-cream">{r.name}</span>
                  <span className="text-sm text-cream/50">· {r.itemId}</span>
                  {!r.approved && (
                    <span className="rounded-full bg-gold/15 px-2 py-0.5 text-[11px] text-gold">
                      pending
                    </span>
                  )}
                </div>
                <p className="mt-1 text-sm text-cream/75">{r.text}</p>
              </div>
              <div className="flex gap-2">
                <button
                  onClick={() => approve(r.id, !r.approved)}
                  className="btn-primary px-5 py-2 text-xs"
                >
                  {r.approved ? "Hide" : "Publish"}
                </button>
                <button
                  onClick={() => del(r.id)}
                  className="rounded-full border border-vermilion/40 px-4 py-2 text-xs text-vermilion transition hover:bg-vermilion/10"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
