"use client";

import { useEffect, useState } from "react";
import AdminNav from "./AdminNav";

type SafeOwner = {
  id: string;
  closet: string;
  name: string;
  email: string;
  bio?: string;
  status: "pending" | "approved" | "declined";
  createdAt: string;
};

const BADGE: Record<SafeOwner["status"], string> = {
  pending: "bg-gold/15 text-gold",
  approved: "bg-emerald/20 text-emerald",
  declined: "bg-vermilion/20 text-vermilion",
};

export default function AdminOwners({ initial }: { initial: SafeOwner[] }) {
  const [owners, setOwners] = useState(initial);
  const [msg, setMsg] = useState("");

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 3000);
    return () => clearTimeout(t);
  }, [msg]);

  async function setStatus(id: string, status: "approved" | "declined") {
    const r = await fetch("/api/admin/owners", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    if (r.ok) {
      setOwners((p) => p.map((o) => (o.id === id ? { ...o, status } : o)));
      setMsg(status === "approved" ? "Approved ✓ they can log in now" : "Declined");
    } else setMsg("Couldn't update");
  }

  const pending = owners.filter((o) => o.status === "pending").length;

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-gold-shimmer">Owners</h1>
          <p className="text-sm text-cream/60">
            Friends who applied to open a closet. {pending} awaiting you.
          </p>
        </div>
        <AdminNav active="owners" />
      </header>

      {msg && (
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">
          {msg}
        </div>
      )}

      {owners.length === 0 ? (
        <p className="py-16 text-center text-cream/60">No applications yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {owners.map((o) => (
            <div key={o.id} className="panel flex flex-wrap items-start gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                  <p className="font-display text-lg text-cream">{o.closet}&apos;s closet</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] capitalize ${BADGE[o.status]}`}>
                    {o.status}
                  </span>
                </div>
                <p className="text-sm text-cream/70">
                  {o.name} · {o.email}
                </p>
                {o.bio && <p className="mt-1 text-sm text-cream/55">{o.bio}</p>}
              </div>
              <div className="flex gap-2">
                {o.status !== "approved" && (
                  <button onClick={() => setStatus(o.id, "approved")} className="btn-primary px-5 py-2 text-xs">
                    Approve
                  </button>
                )}
                {o.status !== "declined" && (
                  <button
                    onClick={() => setStatus(o.id, "declined")}
                    className="rounded-full border border-vermilion/40 px-5 py-2 text-xs text-vermilion transition hover:bg-vermilion/10"
                  >
                    Decline
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
