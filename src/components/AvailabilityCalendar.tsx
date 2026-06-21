"use client";

import { useState } from "react";
import type { DateRange } from "@/lib/types";
import {
  WEEKDAYS,
  isUnavailable,
  monthLabel,
  monthMatrix,
  rangeOverlapsUnavailable,
  startOfDay,
  toISO,
  today,
} from "@/lib/dates";

type Selection = { from: string; to: string } | null;

export default function AvailabilityCalendar({
  unavailable,
  value,
  onChange,
}: {
  unavailable: DateRange[];
  value: Selection;
  onChange: (value: Selection) => void;
}) {
  const now = today();
  const [view, setView] = useState({ year: now.getFullYear(), month: now.getMonth() });
  const weeks = monthMatrix(view.year, view.month);

  const fromISO = value?.from ?? null;
  const toISOValue = value?.to ?? null;

  function shiftMonth(delta: number) {
    setView((v) => {
      const d = new Date(v.year, v.month + delta, 1);
      return { year: d.getFullYear(), month: d.getMonth() };
    });
  }

  function pick(date: Date) {
    const iso = toISO(date);
    if (!fromISO || (fromISO && toISOValue)) {
      onChange({ from: iso, to: "" } as unknown as Selection);
      return;
    }
    const start = startOfDay(new Date(fromISO));
    if (date.getTime() < start.getTime()) {
      onChange({ from: iso, to: "" } as unknown as Selection);
      return;
    }
    if (rangeOverlapsUnavailable(start, date, unavailable)) {
      onChange({ from: iso, to: "" } as unknown as Selection);
      return;
    }
    onChange({ from: fromISO, to: iso });
  }

  function cellState(date: Date) {
    const iso = toISO(date);
    const inMonth = date.getMonth() === view.month;
    const past = date.getTime() < now.getTime();
    const booked = isUnavailable(date, unavailable);
    const isFrom = iso === fromISO;
    const isTo = iso === toISOValue;
    let inRange = false;
    if (fromISO && toISOValue) {
      inRange =
        date.getTime() >= startOfDay(new Date(fromISO)).getTime() &&
        date.getTime() <= startOfDay(new Date(toISOValue)).getTime();
    }
    return { iso, inMonth, disabled: past || booked || !inMonth, booked, isFrom, isTo, inRange };
  }

  return (
    <div className="panel p-4">
      <div className="mb-3 flex items-center justify-between">
        <button
          type="button"
          onClick={() => shiftMonth(-1)}
          className="grid h-8 w-8 place-items-center rounded-full text-gold transition hover:bg-gold/10"
          aria-label="Previous month"
        >
          ‹
        </button>
        <p className="font-display text-xl text-gold">{monthLabel(view.year, view.month)}</p>
        <button
          type="button"
          onClick={() => shiftMonth(1)}
          className="grid h-8 w-8 place-items-center rounded-full text-gold transition hover:bg-gold/10"
          aria-label="Next month"
        >
          ›
        </button>
      </div>

      <div className="mb-1 grid grid-cols-7 text-center text-[11px] font-semibold uppercase tracking-wide text-gold/50">
        {WEEKDAYS.map((d) => (
          <div key={d} className="py-1">
            {d}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1">
        {weeks.flat().map((date) => {
          const s = cellState(date);
          const base = "h-9 rounded-lg text-sm transition flex items-center justify-center";
          let cls = "text-cream/85 hover:bg-gold/10";
          if (!s.inMonth) cls = "text-cream/20";
          if (s.disabled && s.inMonth)
            cls = s.booked
              ? "text-vermilion/60 line-through cursor-not-allowed"
              : "text-cream/25 cursor-not-allowed";
          if (s.inRange) cls = "bg-rani/20 text-cream";
          if (s.isFrom || s.isTo)
            cls = "bg-gradient-to-br from-rani to-marigold text-white font-semibold shadow-glow-pink";
          return (
            <button
              key={s.iso}
              type="button"
              disabled={s.disabled}
              onClick={() => pick(date)}
              className={`${base} ${cls}`}
            >
              {date.getDate()}
            </button>
          );
        })}
      </div>

      <div className="mt-3 flex items-center gap-4 text-[11px] text-cream/60">
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-gradient-to-br from-rani to-marigold" /> selected
        </span>
        <span className="flex items-center gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-vermilion/50" /> booked
        </span>
      </div>
    </div>
  );
}
