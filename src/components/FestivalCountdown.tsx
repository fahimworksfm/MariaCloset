"use client";

import { useEffect, useState } from "react";
import { upcomingEvents } from "@/data/events";

/** Counts down to the soonest upcoming occasion. Computed on mount to avoid
 *  any server/client date mismatch. */
export default function FestivalCountdown({ className = "" }: { className?: string }) {
  const [info, setInfo] = useState<{ name: string; days: number } | null>(null);

  useEffect(() => {
    const now = Date.now();
    const next = upcomingEvents
      .map((e) => ({ name: e.name, t: new Date(`${e.date}T00:00:00`).getTime() }))
      .filter((e) => e.t > now)
      .sort((a, b) => a.t - b.t)[0];
    if (next) setInfo({ name: next.name, days: Math.ceil((next.t - now) / 86_400_000) });
  }, []);

  if (!info) return null;
  return (
    <div className={className}>
      ✦ {info.name} in <span className="font-semibold">{info.days} days</span> — reserve early ✦
    </div>
  );
}
