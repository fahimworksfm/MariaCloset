"use client";

import { useMemo, useState, type ReactNode } from "react";
import type { RentRequest } from "@/lib/types";
import { formatPretty } from "@/lib/dates";
import AdminNav from "./AdminNav";

type Ev = { date: string; type: "Pickup" | "Return"; req: RentRequest };

/** A chronological schedule of pickups & returns, derived from approved
 *  requests. Shared by the admin and owner dashboards (pass scoped requests). */
export default function Schedule({
  requests,
  nav,
}: {
  requests: RentRequest[];
  nav?: ReactNode;
}) {
  const [showPast, setShowPast] = useState(false);
  const today = useMemo(() => new Date().toISOString().slice(0, 10), []);

  const events = useMemo(() => {
    const evs: Ev[] = [];
    for (const r of requests) {
      if (r.status !== "approved") continue;
      evs.push({ date: r.from, type: "Pickup", req: r });
      evs.push({ date: r.to, type: "Return", req: r });
    }
    return evs.sort((a, b) =>
      a.date < b.date ? -1 : a.date > b.date ? 1 : a.type === b.type ? 0 : a.type === "Pickup" ? -1 : 1,
    );
  }, [requests]);

  const upcoming = events.filter((e) => e.date >= today);
  const shown = showPast ? events : upcoming;

  // group consecutive events by date for date headings
  const groups: { date: string; items: Ev[] }[] = [];
  for (const e of shown) {
    const last = groups[groups.length - 1];
    if (last && last.date === e.date) last.items.push(e);
    else groups.push({ date: e.date, items: [e] });
  }

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-gold-shimmer">Schedule</h1>
          <p className="text-sm text-cream/60">
            Pickups &amp; returns from confirmed rentals, in order.
          </p>
        </div>
        {nav ?? <AdminNav active="schedule" />}
      </header>

      <div className="my-6 flex items-center gap-2">
        {(["Upcoming", "All"] as const).map((label) => {
          const active = (label === "All") === showPast;
          return (
            <button
              key={label}
              onClick={() => setShowPast(label === "All")}
              className={`rounded-full px-4 py-1.5 text-sm transition ${
                active ? "bg-cream text-night" : "chip hover:bg-cream/5"
              }`}
            >
              {label}
            </button>
          );
        })}
        <span className="ml-auto text-sm text-cream/45">
          {upcoming.length} upcoming event{upcoming.length === 1 ? "" : "s"}
        </span>
      </div>

      {shown.length === 0 ? (
        <p className="py-16 text-center text-cream/55">
          No {showPast ? "" : "upcoming "}pickups or returns yet. They appear here once a request is
          approved.
        </p>
      ) : (
        <div className="space-y-6">
          {groups.map((g) => (
            <div key={g.date}>
              <div className="mb-2 flex items-center gap-3">
                <h2 className="font-display text-xl text-cream">{formatPretty(g.date)}</h2>
                {g.date === today && (
                  <span className="rounded-full border border-cream/25 px-2 py-0.5 text-[10px] uppercase tracking-wider text-cream/70">
                    Today
                  </span>
                )}
                <div className="h-px flex-1 bg-cream/10" />
              </div>
              <div className="space-y-2">
                {g.items.map((e, i) => (
                  <div
                    key={`${e.req.id}-${e.type}-${i}`}
                    className="panel flex flex-wrap items-center gap-x-4 gap-y-1 p-4"
                  >
                    <span
                      className={`rounded-full px-2.5 py-0.5 text-[11px] uppercase tracking-wider ${
                        e.type === "Pickup"
                          ? "bg-cream/90 text-night"
                          : "border border-cream/25 text-cream/80"
                      }`}
                    >
                      {e.type}
                    </span>
                    <span className="font-display text-lg text-cream">{e.req.itemName}</span>
                    <span className="text-sm text-cream/55">· {e.req.renterName}</span>
                    {e.req.method && (
                      <span className="text-sm text-cream/45">· {e.req.method}</span>
                    )}
                    <span className="ml-auto text-sm text-cream/45">{e.req.contact}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
