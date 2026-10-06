"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import type { RentRequest } from "@/lib/types";
import type { RewardPreview } from "@/lib/rewards";
import { money, rewardsConfig } from "@/data/config";
import { formatPretty } from "@/lib/dates";
import { netTotal } from "@/lib/requestMath";
import AdminNav from "./AdminNav";

type Filter = "all" | "pending" | "approved" | "declined";

const BADGE: Record<RentRequest["status"], string> = {
  pending: "bg-gold/15 text-gold",
  approved: "bg-emerald/20 text-emerald",
  declined: "bg-vermilion/20 text-vermilion",
};

export default function AdminRequests({
  initial,
  endpoint = "/api/admin/requests",
  nav,
  previews = {},
}: {
  initial: RentRequest[];
  endpoint?: string;
  nav?: ReactNode;
  /** Reward preview per pending request (what approving would apply). */
  previews?: Record<string, RewardPreview>;
}) {
  const [requests, setRequests] = useState(initial);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const [filter, setFilter] = useState<Filter>("all");

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  const stats = useMemo(() => {
    const approved = requests.filter((r) => r.status === "approved");
    return {
      total: requests.length,
      pending: requests.filter((r) => r.status === "pending").length,
      approved: approved.length,
      revenue: approved.reduce((s, r) => s + netTotal(r), 0),
    };
  }, [requests]);

  const shown = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  async function setStatus(id: string, status: "approved" | "declined") {
    setBusy(id);
    const r = await fetch(endpoint, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, status }),
    });
    setBusy("");
    const d = await r.json().catch(() => ({}));
    if (r.ok) {
      // Take the server's copy: on approve it carries the rewards just applied.
      setRequests((prev) => prev.map((x) => (x.id === id ? { ...x, ...(d.request ?? {}), status } : x)));
      setMsg(status === "approved" ? "Approved ✓ those dates are now blocked" : "Declined");
    } else {
      setMsg(d.error || "Couldn't update");
    }
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-gold-shimmer">Requests</h1>
          <p className="text-sm text-cream/60">
            Approve to confirm a rental — it auto-blocks those dates on the rail.
          </p>
        </div>
        {nav ?? <AdminNav active="requests" />}
      </header>

      {msg && (
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">
          {msg}
        </div>
      )}

      <div className="my-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          ["Requests", String(stats.total)],
          ["Pending", String(stats.pending)],
          ["Approved", String(stats.approved)],
          ["Approved revenue", money(stats.revenue)],
        ].map(([label, value]) => (
          <div key={label} className="panel p-4">
            <p className="eyebrow">{label}</p>
            <p className="mt-1 font-display text-3xl text-gold">{value}</p>
          </div>
        ))}
      </div>

      <div className="mb-4 flex flex-wrap gap-2">
        {(["all", "pending", "approved", "declined"] as Filter[]).map((f) => (
          <button
            key={f}
            onClick={() => setFilter(f)}
            className={`rounded-full px-4 py-1.5 text-sm capitalize transition ${
              filter === f ? "bg-gradient-to-r from-rani to-marigold text-white" : "chip hover:bg-gold/15"
            }`}
          >
            {f}
          </button>
        ))}
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-cream/60">No {filter === "all" ? "" : filter} requests yet.</p>
      ) : (
        <div className="space-y-3">
          {shown.map((r) => (
            <div key={r.id} className="panel flex flex-wrap items-center gap-4 p-4">
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <p className="truncate font-display text-lg text-cream">{r.itemName}</p>
                  <span className={`rounded-full px-2 py-0.5 text-[11px] capitalize ${BADGE[r.status]}`}>
                    {r.status}
                  </span>
                </div>
                <p className="text-sm text-cream/70">
                  {formatPretty(r.from)} → {formatPretty(r.to)} · {r.days} day
                  {r.days > 1 ? "s" : ""} ·{" "}
                  {r.adjustments?.length ? (
                    <>
                      <span className="text-cream">{money(netTotal(r))}</span>{" "}
                      <s className="text-cream/35">{money(r.total)}</s>
                    </>
                  ) : (
                    <span className="text-gold">{money(r.total)}</span>
                  )}
                </p>
                <p className="text-sm text-cream/60">
                  {r.renterName} · {r.contact}
                  {r.method ? ` · ${r.method}` : ""}
                </p>
                {r.message && <p className="mt-1 text-sm text-cream/50">“{r.message}”</p>}
                <RewardsLine r={r} preview={previews[r.id]} />
              </div>
              {r.status === "pending" ? (
                <div className="flex gap-2">
                  <button
                    onClick={() => setStatus(r.id, "approved")}
                    className="btn-primary px-5 py-2 text-xs"
                    disabled={busy === r.id}
                  >
                    {busy === r.id ? "…" : "Approve"}
                  </button>
                  <button
                    onClick={() => setStatus(r.id, "declined")}
                    className="rounded-full border border-vermilion/40 px-5 py-2 text-xs text-vermilion transition hover:bg-vermilion/10"
                    disabled={busy === r.id}
                  >
                    Decline
                  </button>
                </div>
              ) : (
                <span className="text-xs text-cream/40">
                  {new Date(r.createdAt).toLocaleDateString()}
                </span>
              )}
            </div>
          ))}
        </div>
      )}
    </main>
  );
}

const offList = (adj: { label: string; amount: number }[]) =>
  adj.map((a) => `${a.label} −${money(a.amount)}`).join(" · ");

/** Pending: who this renter is in the programme + what approving applies.
 *  Approved: what was applied. */
function RewardsLine({ r, preview }: { r: RentRequest; preview?: RewardPreview }) {
  if (r.status === "approved" && r.adjustments?.length) {
    return <p className="mt-1.5 text-xs text-cream/55">Rewards applied: {offList(r.adjustments)}</p>;
  }
  if (r.status !== "pending" || !preview?.applies) {
    return r.referredBy ? <p className="mt-1.5 text-xs text-cream/45">Invited by {r.referredBy}</p> : null;
  }
  const facts = [
    preview.tier !== rewardsConfig.tiers[0].name ? preview.tier : null,
    preview.credit > 0 ? `${money(preview.credit)} credit` : null,
    r.referredBy ? `invited by ${r.referredBy}` : null,
  ].filter(Boolean);
  if (!facts.length && !preview.adjustments.length) return null;
  return (
    <div className="mt-1.5 space-y-0.5 text-xs">
      {facts.length > 0 && <p className="text-cream/55">{facts.join(" · ")}</p>}
      {preview.adjustments.length > 0 && (
        <p className="text-cream/70">
          On approval: {offList(preview.adjustments)} → <span className="text-cream">{money(preview.net)}</span>
        </p>
      )}
    </div>
  );
}
