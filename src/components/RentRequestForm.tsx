"use client";

import { useMemo, useState } from "react";
import type { Item } from "@/lib/types";
import { money, siteConfig } from "@/data/config";
import { formatPretty, inclusiveDays, parseISO } from "@/lib/dates";
import AvailabilityCalendar from "./AvailabilityCalendar";

type Selection = { from: string; to: string } | null;
type Status = "idle" | "submitting" | "success" | "error";

type Confirmed = {
  id: string;
  from: string;
  to: string;
  days: number;
  total: number;
  stored: boolean;
};

export default function RentRequestForm({ item }: { item: Item }) {
  const [range, setRange] = useState<Selection>(null);
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [confirmed, setConfirmed] = useState<Confirmed | null>(null);

  const complete = !!(range?.from && range?.to);
  const days = useMemo(
    () => (complete ? inclusiveDays(parseISO(range!.from), parseISO(range!.to)) : 0),
    [complete, range],
  );
  const total = days * item.pricePerDay;
  const canSubmit = complete && name.trim() && contact.trim() && status !== "submitting";

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!canSubmit) return;
    setStatus("submitting");
    setError("");
    try {
      const res = await fetch("/api/requests", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId: item.id,
          renterName: name,
          contact,
          from: range!.from,
          to: range!.to,
          message,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Something went wrong. Please try again.");
        setStatus("error");
        return;
      }
      setConfirmed({
        id: data.request.id,
        from: data.request.from,
        to: data.request.to,
        days: data.request.days,
        total: data.request.total,
        stored: data.stored,
      });
      setStatus("success");
    } catch {
      setError("Couldn't reach the server. Please try again.");
      setStatus("error");
    }
  }

  if (status === "success" && confirmed) {
    const mailto =
      siteConfig.ownerEmail &&
      `mailto:${siteConfig.ownerEmail}?subject=${encodeURIComponent(
        `Rental request — ${item.name}`,
      )}&body=${encodeURIComponent(
        `Hi ${siteConfig.ownerName},\n\nI'd love to rent the ${item.name} from ${formatPretty(
          confirmed.from,
        )} to ${formatPretty(confirmed.to)} (${confirmed.days} day${
          confirmed.days > 1 ? "s" : ""
        }, ${money(confirmed.total)} total).\n\nName: ${name}\nContact: ${contact}\n${
          message ? `Note: ${message}\n` : ""
        }\nThank you!`,
      )}`;

    return (
      <div className="panel p-6">
        <div className="mb-2 flex items-center gap-2">
          <span className="grid h-8 w-8 place-items-center rounded-full bg-gradient-to-br from-emerald to-peacock text-white shadow-glow">
            ✓
          </span>
          <h3 className="font-display text-2xl text-gold">Request sent!</h3>
        </div>
        <p className="text-sm text-cream/80">
          Thanks, {name.split(" ")[0] || "lovely"}! Your request for the{" "}
          <span className="text-gold">{item.name}</span> from{" "}
          <span className="text-gold">{formatPretty(confirmed.from)}</span> to{" "}
          <span className="text-gold">{formatPretty(confirmed.to)}</span> ({confirmed.days} day
          {confirmed.days > 1 ? "s" : ""}, {money(confirmed.total)}) has been logged.{" "}
          {siteConfig.ownerName} will confirm shortly.
        </p>
        {!confirmed.stored && (
          <p className="mt-3 rounded-lg border border-gold/20 bg-gold/10 px-3 py-2 text-xs text-cream/80">
            Heads up: this request couldn&apos;t be saved on the server.
            {mailto ? " Use the button below so it reaches " : " Please reach out to "}
            {siteConfig.ownerName} directly.
          </p>
        )}
        <div className="mt-4 flex flex-wrap gap-3">
          {mailto && (
            <a href={mailto} className="btn-primary">
              Also send by email
            </a>
          )}
          <button
            type="button"
            onClick={() => {
              setConfirmed(null);
              setRange(null);
              setName("");
              setContact("");
              setMessage("");
              setStatus("idle");
            }}
            className="btn-ghost"
          >
            Make another request
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <div>
        <p className="eyebrow mb-2">Choose your dates</p>
        <AvailabilityCalendar unavailable={item.unavailable} value={range} onChange={setRange} />
        <p className="mt-2 text-xs text-cream/60">
          {range?.from && !range?.to
            ? "Now pick a return date."
            : complete
              ? `${formatPretty(range!.from)} → ${formatPretty(range!.to)}`
              : "Tap a start date, then a return date."}
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="eyebrow mb-1.5 block">Your name</label>
          <input
            className="field"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Jane Doe"
            required
          />
        </div>
        <div>
          <label className="eyebrow mb-1.5 block">Email or phone</label>
          <input
            className="field"
            value={contact}
            onChange={(e) => setContact(e.target.value)}
            placeholder="jane@email.com"
            required
          />
        </div>
      </div>

      <div>
        <label className="eyebrow mb-1.5 block">Note (optional)</label>
        <textarea
          className="field min-h-[88px] resize-y"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          placeholder="What's the occasion? Any questions?"
        />
      </div>

      <div className="panel flex flex-col gap-4 p-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="text-sm text-cream/70">
          {complete ? (
            <>
              <span className="text-gold">{money(item.pricePerDay)}</span> × {days} day
              {days > 1 ? "s" : ""}
            </>
          ) : (
            <>Pick dates to see your total</>
          )}
          <div className="font-display text-3xl text-gold-shimmer">
            {complete ? money(total) : "—"}
          </div>
        </div>
        <button type="submit" className="btn-primary" disabled={!canSubmit}>
          {status === "submitting" ? "Sending…" : "Request to rent"}
        </button>
      </div>

      {status === "error" && (
        <p className="rounded-lg border border-vermilion/40 bg-vermilion/15 px-3 py-2 text-sm text-cream">
          {error}
        </p>
      )}
    </form>
  );
}
