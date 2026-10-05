"use client";

import Link from "next/link";
import { useMemo, useState, type ReactNode } from "react";
import { money } from "@/data/config";
import {
  computeInsights,
  compactMoney,
  niceScale,
  type Bucket,
  type InsightPiece,
  type InsightRequest,
  type InsightWait,
  type PieceRow,
  type RangeKey,
} from "@/lib/insights";
import AdminNav from "./AdminNav";

const RANGES: [RangeKey, string][] = [
  ["30d", "Last 30 days"],
  ["90d", "Last 90 days"],
  ["12m", "Last 12 months"],
  ["all", "All time"],
];

// Emphasis form: the current period in bone, earlier periods in a context grey.
// (Contrast >= 3:1 on the panel surface; ΔE 41.7 between the two.)
const EMPHASIS = "bg-[#ECE7DD]";
const CONTEXT = "bg-[#6B665E]";
const CONTEXT_HOVER = "bg-[#8C877F]";

export default function Insights({
  pieces,
  requests,
  waitlist,
  saves,
  now,
  subtitle = "How the closet is doing.",
  nav,
}: {
  pieces: InsightPiece[];
  requests: InsightRequest[];
  waitlist: InsightWait[];
  saves: Record<string, number>;
  /** Server "now" (ISO) so server render and hydration bucket identically. */
  now: string;
  subtitle?: string;
  nav?: ReactNode;
}) {
  const [range, setRange] = useState<RangeKey>("30d");
  const d = useMemo(
    () => computeInsights(range, now, pieces, requests, waitlist, saves),
    [range, now, pieces, requests, waitlist, saves],
  );

  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-gold-shimmer">Insights</h1>
          <p className="text-sm text-cream/60">{subtitle}</p>
        </div>
        {nav ?? <AdminNav active="insights" />}
      </header>

      {/* One filter row, scoping everything below it. */}
      <div className="mt-6 flex flex-wrap items-center gap-2" role="group" aria-label="Date range">
        {RANGES.map(([key, label]) => (
          <button
            key={key}
            onClick={() => setRange(key)}
            aria-pressed={range === key}
            className={`rounded-full px-4 py-1.5 text-sm transition ${
              range === key ? "bg-cream text-night" : "chip hover:bg-cream/5"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      <div className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
        <StatTile
          label="Booked revenue"
          value={money(d.revenue)}
          delta={delta(d.revenue, d.revenuePrev, d.prevLabel)}
        />
        <StatTile
          label="Requests"
          value={String(d.requests)}
          delta={delta(d.requests, d.requestsPrev, d.prevLabel)}
          sub={`${d.approved} approved · ${d.pending} pending · ${d.declined} declined`}
        />
        <StatTile
          label="Approval rate"
          value={d.approvalRate === null ? "—" : `${Math.round(d.approvalRate * 100)}%`}
          sub="Of requests you've decided"
        />
        <StatTile label="Active & upcoming" value={String(d.upcoming)} sub="Confirmed rentals, right now" />
      </div>

      <RevenueChart buckets={d.buckets} granularity={d.granularity} />
      <PiecesTable rows={d.rows} />
    </main>
  );
}

/* ----------------------------------------------------------------------- */

type Delta = { dir: "up" | "down" | "flat"; text: string } | undefined;

function delta(cur: number, prev: number | null, label: string | null): Delta {
  if (prev === null || label === null || (cur === 0 && prev === 0)) return undefined;
  if (prev === 0) return { dir: "up", text: "Up from none the period before" };
  const pct = Math.round(((cur - prev) / prev) * 100);
  if (pct === 0) return { dir: "flat", text: `No change ${label}` };
  return { dir: pct > 0 ? "up" : "down", text: `${Math.abs(pct)}% ${label}` };
}

function StatTile({ label, value, delta, sub }: { label: string; value: string; delta?: Delta; sub?: string }) {
  return (
    <div className="panel p-5">
      <p className="text-xs text-cream/50">{label}</p>
      {/* Sans, semibold, proportional figures — never the display serif. */}
      <p className="mt-2 font-sans text-3xl font-semibold tracking-tight text-cream">{value}</p>
      {delta && (
        <p className="mt-1.5 text-xs text-cream/60">
          {delta.dir !== "flat" && (
            <>
              <span aria-hidden>{delta.dir === "up" ? "▲ " : "▼ "}</span>
              <span className="sr-only">{delta.dir === "up" ? "Up " : "Down "}</span>
            </>
          )}
          {delta.text}
        </p>
      )}
      {sub && <p className="mt-1.5 text-xs text-cream/40">{sub}</p>}
    </div>
  );
}

/* ----------------------------------------------------------------------- */

const PLOT_H = 200;

function RevenueChart({ buckets, granularity }: { buckets: Bucket[]; granularity: "week" | "month" }) {
  const [active, setActive] = useState<number | null>(null);
  const [asTable, setAsTable] = useState(false);

  const max = Math.max(0, ...buckets.map((b) => b.revenue));
  const { top, ticks } = niceScale(max);
  const empty = max === 0;
  // Label sparingly: the current period if it has bookings, else the peak.
  const cur = buckets.findIndex((b) => b.current);
  const labelIdx = cur >= 0 && buckets[cur].revenue > 0 ? cur : buckets.findIndex((b) => b.revenue === max && max > 0);
  const n = buckets.length;
  // Thin x-labels to what fits (never clip them): "Sep 14" needs ~50px, "Sep" ~30px.
  // Roughly 280px of plot on phones, ~800px on desktop.
  const per = granularity === "week" ? 50 : 30;
  const mobileStep = Math.max(1, Math.ceil(n / Math.floor(280 / per)));
  const desktopStep = Math.max(1, Math.ceil(n / Math.floor(800 / per)));

  return (
    <section className="panel mt-6 p-5 sm:p-6">
      <div className="flex items-baseline justify-between gap-3">
        <div>
          <h2 className="text-sm font-medium text-cream">Booked revenue</h2>
          <p className="text-xs text-cream/50">
            Approved bookings by {granularity} · current {granularity} highlighted
          </p>
        </div>
        <button
          onClick={() => setAsTable((v) => !v)}
          className="shrink-0 text-xs text-cream/55 underline-offset-4 transition hover:text-cream hover:underline"
        >
          {asTable ? "View as chart" : "View as table"}
        </button>
      </div>

      {asTable ? (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-xs text-cream/45">
                <th className="py-2 font-normal">{granularity === "week" ? "Week" : "Month"}</th>
                <th className="py-2 text-right font-normal">Bookings</th>
                <th className="py-2 text-right font-normal">Booked revenue</th>
              </tr>
            </thead>
            <tbody>
              {buckets.map((b) => (
                <tr key={b.start} className="border-t border-cream/[0.06]">
                  <td className="py-2 text-cream/75">{b.long}</td>
                  <td className="py-2 text-right tabular-nums text-cream/75">{b.bookings}</td>
                  <td className="py-2 text-right tabular-nums text-cream">{money(b.revenue)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : empty ? (
        <p className="py-16 text-center text-sm text-cream/45">No bookings in this period yet.</p>
      ) : (
        <div className="mt-8 flex gap-3">
          {/* y-axis ticks */}
          <div className="relative w-11 shrink-0" style={{ height: PLOT_H }} aria-hidden>
            {ticks.map((t) => (
              <span
                key={t}
                className="absolute right-0 translate-y-1/2 text-[11px] tabular-nums text-cream/40"
                style={{ bottom: `${(t / top) * 100}%` }}
              >
                {compactMoney(t)}
              </span>
            ))}
          </div>

          <div className="min-w-0 flex-1">
            <div className="relative" style={{ height: PLOT_H }}>
              {ticks.map((t) => (
                <div
                  key={t}
                  aria-hidden
                  className="absolute inset-x-0 h-px bg-cream/[0.08]"
                  style={{ bottom: `${(t / top) * 100}%` }}
                />
              ))}
              <div className="absolute inset-0 flex">
                {buckets.map((b, i) => {
                  const h = b.revenue > 0 ? Math.max(2, (b.revenue / top) * PLOT_H) : 0;
                  const fill = b.current ? EMPHASIS : active === i ? CONTEXT_HOVER : CONTEXT;
                  // Keep the tooltip inside the card at the edges.
                  const align =
                    i < 2 ? "left-0" : i > n - 3 ? "right-0" : "left-1/2 -translate-x-1/2";
                  return (
                    <div
                      key={b.start}
                      tabIndex={0}
                      role="img"
                      aria-label={`${b.long}: ${money(b.revenue)} booked, ${b.bookings} booking${b.bookings === 1 ? "" : "s"}`}
                      onMouseEnter={() => setActive(i)}
                      onMouseLeave={() => setActive(null)}
                      onFocus={() => setActive(i)}
                      onBlur={() => setActive(null)}
                      // The whole slot is the hit target — taller and wider than the mark.
                      className="relative flex flex-1 cursor-default items-end justify-center outline-none focus-visible:bg-cream/[0.04]"
                    >
                      {i === labelIdx && active !== i && (
                        <span
                          className="absolute whitespace-nowrap text-[11px] tabular-nums text-cream/80"
                          style={{ bottom: h + 6 }}
                        >
                          {compactMoney(b.revenue)}
                        </span>
                      )}
                      <div
                        className={`w-[min(24px,60%)] rounded-t-[4px] transition-colors ${fill}`}
                        style={{ height: h }}
                      />
                      {active === i && (
                        <div
                          role="tooltip"
                          className={`pointer-events-none absolute z-10 whitespace-nowrap rounded-md border border-cream/15 bg-night px-3 py-2 shadow-panel ${align}`}
                          style={{ bottom: h + 10 }}
                        >
                          <div className="text-sm font-semibold tabular-nums text-cream">{money(b.revenue)}</div>
                          <div className="text-[11px] text-cream/55">
                            {b.long} · {b.bookings} booking{b.bookings === 1 ? "" : "s"}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
            {/* x-axis labels: thinned per breakpoint; a label may overflow into a
                blank neighbour (flex-centred) but is never clipped */}
            <div className="mt-2 flex" aria-hidden>
              {buckets.map((b, i) => (
                <div key={b.start} className="flex min-w-0 flex-1 justify-center">
                  <span
                    className={`whitespace-nowrap text-[11px] text-cream/40 ${
                      i % mobileStep ? "max-sm:invisible" : ""
                    } ${i % desktopStep ? "sm:invisible" : ""}`}
                  >
                    {b.label}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </section>
  );
}

/* ----------------------------------------------------------------------- */

type SortKey = "requests" | "booked" | "revenue" | "waitlist" | "saves";
const COLS: [SortKey, string][] = [
  ["requests", "Requests"],
  ["booked", "Booked"],
  ["revenue", "Revenue"],
  ["waitlist", "Waitlist"],
  ["saves", "Saves"],
];

function PiecesTable({ rows }: { rows: PieceRow[] }) {
  const [sort, setSort] = useState<SortKey>("revenue");
  const sorted = useMemo(
    () => [...rows].sort((a, b) => b[sort] - a[sort] || b.requests - a.requests || a.name.localeCompare(b.name)),
    [rows, sort],
  );
  const maxRevenue = Math.max(1, ...rows.map((r) => r.revenue));

  return (
    <section className="panel mt-6 p-5 sm:p-6">
      <h2 className="text-sm font-medium text-cream">Pieces</h2>
      <p className="text-xs text-cream/50">
        Click a column to rank by it. Saves are all-time; everything else follows the date range.
      </p>
      {rows.length === 0 ? (
        <p className="py-12 text-center text-sm text-cream/45">No pieces yet.</p>
      ) : (
        <div className="mt-4 overflow-x-auto">
          <table className="w-full min-w-[640px] text-sm">
            <thead>
              <tr className="text-xs text-cream/45">
                <th className="py-2 text-left font-normal">Piece</th>
                {COLS.map(([key, label]) => (
                  <th key={key} className="py-2 text-right font-normal" aria-sort={sort === key ? "descending" : "none"}>
                    <button
                      onClick={() => setSort(key)}
                      className={`transition hover:text-cream ${sort === key ? "text-cream" : ""}`}
                    >
                      {label}
                      {sort === key ? " ↓" : ""}
                    </button>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {sorted.map((r) => (
                <tr key={r.id} className="border-t border-cream/[0.06]">
                  <td className="py-2.5 pr-4">
                    <div className="flex items-center gap-3">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={r.image} alt="" className="h-10 w-8 shrink-0 bg-white/[0.03] object-cover" />
                      <Link href={`/items/${r.id}`} className="truncate text-cream/85 transition hover:text-cream">
                        {r.name}
                      </Link>
                    </div>
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-cream/70">{r.requests}</td>
                  <td className="py-2.5 text-right tabular-nums text-cream/70">{r.booked}</td>
                  <td className="py-2.5 text-right">
                    <div className="flex items-center justify-end gap-3">
                      <div className="hidden h-1 w-20 rounded-full bg-cream/[0.07] sm:block" aria-hidden>
                        <div
                          className="h-full rounded-full bg-cream/70"
                          style={{ width: `${(r.revenue / maxRevenue) * 100}%` }}
                        />
                      </div>
                      <span className="tabular-nums text-cream">{money(r.revenue)}</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-right tabular-nums text-cream/70">{r.waitlist}</td>
                  <td className="py-2.5 text-right tabular-nums text-cream/70">{r.saves}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}
