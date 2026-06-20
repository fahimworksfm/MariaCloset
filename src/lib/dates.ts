import type { DateRange } from "@/lib/types";

/** Local-midnight Date from a yyyy-mm-dd string (avoids UTC off-by-one). */
export function parseISO(iso: string): Date {
  const [y, m, d] = iso.split("-").map(Number);
  return new Date(y, m - 1, d);
}

export function toISO(date: Date): string {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, "0");
  const d = String(date.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

export function startOfDay(date: Date): Date {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}

export function today(): Date {
  return startOfDay(new Date());
}

export function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

export function isSameDay(a: Date, b: Date): boolean {
  return toISO(a) === toISO(b);
}

/** Whole days between two dates (inclusive of both ends → rental nights + 1). */
export function inclusiveDays(from: Date, to: Date): number {
  const ms = startOfDay(to).getTime() - startOfDay(from).getTime();
  return Math.round(ms / 86_400_000) + 1;
}

export function isUnavailable(date: Date, ranges: DateRange[]): boolean {
  const t = startOfDay(date).getTime();
  return ranges.some((r) => {
    const from = parseISO(r.from).getTime();
    const to = parseISO(r.to).getTime();
    return t >= from && t <= to;
  });
}

/** True if any day in [from, to] collides with an unavailable range. */
export function rangeOverlapsUnavailable(
  from: Date,
  to: Date,
  ranges: DateRange[],
): boolean {
  let cursor = startOfDay(from);
  const end = startOfDay(to);
  while (cursor.getTime() <= end.getTime()) {
    if (isUnavailable(cursor, ranges)) return true;
    cursor = addDays(cursor, 1);
  }
  return false;
}

export const WEEKDAYS = ["Su", "Mo", "Tu", "We", "Th", "Fr", "Sa"];

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

export function monthLabel(year: number, month: number): string {
  return `${MONTHS[month]} ${year}`;
}

/**
 * A 6-row grid of dates for the given month, padded with leading/trailing days
 * from the neighbouring months so each row has 7 entries.
 */
export function monthMatrix(year: number, month: number): Date[][] {
  const first = new Date(year, month, 1);
  const start = addDays(first, -first.getDay());
  const weeks: Date[][] = [];
  let cursor = start;
  for (let w = 0; w < 6; w++) {
    const row: Date[] = [];
    for (let d = 0; d < 7; d++) {
      row.push(cursor);
      cursor = addDays(cursor, 1);
    }
    weeks.push(row);
  }
  return weeks;
}

export function formatPretty(iso: string): string {
  const d = parseISO(iso);
  return d.toLocaleDateString(undefined, {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}
