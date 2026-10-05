/**
 * Pure insights maths for the admin/owner dashboards. Runs in the browser on
 * already-scoped data, so it must not import server-only modules. All date
 * bucketing is UTC so server render and client hydration always agree.
 */

export type RangeKey = "30d" | "90d" | "12m" | "all";

export type InsightRequest = {
  id: string;
  itemId: string;
  status: "pending" | "approved" | "declined";
  total: number;
  createdAt: string;
  to: string;
};
export type InsightWait = { itemId: string; createdAt: string };
export type InsightPiece = { id: string; name: string; image: string };

export type Bucket = { start: number; label: string; long: string; revenue: number; bookings: number; current: boolean };
export type PieceRow = {
  id: string;
  name: string;
  image: string;
  requests: number;
  booked: number;
  revenue: number;
  waitlist: number;
  saves: number;
};
export type Insights = {
  revenue: number;
  revenuePrev: number | null;
  requests: number;
  requestsPrev: number | null;
  approved: number;
  pending: number;
  declined: number;
  approvalRate: number | null;
  upcoming: number;
  granularity: "week" | "month";
  buckets: Bucket[];
  rows: PieceRow[];
  prevLabel: string | null;
};

const DAY = 86_400_000;
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

const monthStart = (t: number) => {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), 1);
};
const addMonths = (t: number, n: number) => {
  const d = new Date(t);
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth() + n, 1);
};
const weekStart = (t: number) => {
  const d = new Date(t);
  const dow = (d.getUTCDay() + 6) % 7; // Monday = 0
  return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - dow);
};

export function computeInsights(
  range: RangeKey,
  nowIso: string,
  pieces: InsightPiece[],
  requests: InsightRequest[],
  waitlist: InsightWait[],
  saves: Record<string, number>,
): Insights {
  const now = new Date(nowIso).getTime();
  const today = nowIso.slice(0, 10);
  const times = requests.map((r) => new Date(r.createdAt).getTime());

  // The selected window [start, now] and the equal-length window before it.
  let start: number;
  let prevStart: number | null = null;
  let prevLabel: string | null = null;
  if (range === "30d" || range === "90d") {
    const days = range === "30d" ? 30 : 90;
    start = now - days * DAY;
    prevStart = start - days * DAY;
    prevLabel = `vs previous ${days} days`;
  } else if (range === "12m") {
    start = addMonths(monthStart(now), -11);
    prevStart = addMonths(start, -12);
    prevLabel = "vs previous 12 months";
  } else {
    const first = times.length ? Math.min(...times) : now;
    start = Math.min(monthStart(first), addMonths(monthStart(now), -5)); // at least 6 months
  }

  const inRange = (t: number) => t >= start && t <= now;
  const inPrev = (t: number) => prevStart !== null && t >= prevStart && t < start;

  let revenue = 0, revenuePrev = 0, count = 0, countPrev = 0;
  let approved = 0, pending = 0, declined = 0;
  requests.forEach((r, i) => {
    const t = times[i];
    if (inRange(t)) {
      count++;
      if (r.status === "approved") { approved++; revenue += r.total; }
      else if (r.status === "pending") pending++;
      else declined++;
    } else if (inPrev(t)) {
      countPrev++;
      if (r.status === "approved") revenuePrev += r.total;
    }
  });

  // Buckets: weekly for short windows, monthly otherwise. Only in-range
  // requests are counted, so the buckets always sum to the revenue tile.
  const granularity: "week" | "month" = range === "30d" || range === "90d" ? "week" : "month";
  const buckets: Bucket[] = [];
  for (
    let b = granularity === "week" ? weekStart(start) : monthStart(start);
    b <= now;
    b = granularity === "week" ? b + 7 * DAY : addMonths(b, 1)
  ) {
    const next = granularity === "week" ? b + 7 * DAY : addMonths(b, 1);
    const d = new Date(b);
    const mon = MONTHS[d.getUTCMonth()];
    buckets.push({
      start: b,
      label: granularity === "week" ? `${mon} ${d.getUTCDate()}` : mon,
      long:
        granularity === "week"
          ? `Week of ${mon} ${d.getUTCDate()}, ${d.getUTCFullYear()}`
          : `${mon} ${d.getUTCFullYear()}`,
      revenue: 0,
      bookings: 0,
      current: now >= b && now < next,
    });
  }
  requests.forEach((r, i) => {
    const t = times[i];
    if (r.status !== "approved" || !inRange(t)) return;
    for (let k = buckets.length - 1; k >= 0; k--) {
      if (t >= buckets[k].start) {
        buckets[k].revenue += r.total;
        buckets[k].bookings++;
        break;
      }
    }
  });

  // Per-piece rows (whole catalogue, including pieces with no activity yet).
  const rows = new Map<string, PieceRow>(
    pieces.map((p) => [
      p.id,
      { id: p.id, name: p.name, image: p.image, requests: 0, booked: 0, revenue: 0, waitlist: 0, saves: saves[p.id] ?? 0 },
    ]),
  );
  requests.forEach((r, i) => {
    const row = rows.get(r.itemId);
    if (!row || !inRange(times[i])) return;
    row.requests++;
    if (r.status === "approved") { row.booked++; row.revenue += r.total; }
  });
  waitlist.forEach((w) => {
    const row = rows.get(w.itemId);
    if (row && inRange(new Date(w.createdAt).getTime())) row.waitlist++;
  });

  const decided = approved + declined;
  return {
    revenue,
    revenuePrev: prevStart === null ? null : revenuePrev,
    requests: count,
    requestsPrev: prevStart === null ? null : countPrev,
    approved,
    pending,
    declined,
    approvalRate: decided ? approved / decided : null,
    upcoming: requests.filter((r) => r.status === "approved" && r.to >= today).length,
    granularity,
    buckets,
    rows: Array.from(rows.values()),
    prevLabel,
  };
}

/** Round a max up to a clean axis top and pick ~4 tick steps. */
export function niceScale(max: number): { top: number; ticks: number[] } {
  if (max <= 0) return { top: 100, ticks: [0, 25, 50, 75, 100] };
  const raw = max / 4;
  const mag = 10 ** Math.floor(Math.log10(raw));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * mag).find((s) => s >= raw) ?? 10 * mag;
  const top = Math.ceil(max / step) * step;
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Math.round(v * 100) / 100);
  return { top, ticks };
}

/** $1,284 → "$1.3K" for axis ticks. */
export function compactMoney(n: number): string {
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(n % 1_000_000 ? 1 : 0)}M`;
  if (n >= 1_000) return `$${(n / 1_000).toFixed(n % 1_000 ? 1 : 0)}K`;
  return `$${Math.round(n)}`;
}
