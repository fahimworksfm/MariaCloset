"use client";

import type { WaitlistEntry } from "@/lib/types";
import AdminNav from "./AdminNav";

export default function AdminWaitlist({ initial }: { initial: WaitlistEntry[] }) {
  return (
    <main className="mx-auto max-w-5xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-gold-shimmer">Waitlist</h1>
          <p className="text-sm text-cream/60">
            People who want to be told when a piece frees up.
          </p>
        </div>
        <AdminNav active="waitlist" />
      </header>

      {initial.length === 0 ? (
        <p className="py-16 text-center text-cream/60">No waitlist entries yet.</p>
      ) : (
        <div className="mt-6 space-y-3">
          {initial.map((w) => (
            <div key={w.id} className="panel flex items-center justify-between gap-4 p-4">
              <div className="min-w-0">
                <p className="truncate font-display text-lg text-cream">{w.itemName}</p>
                <p className="text-sm text-cream/70">{w.contact}</p>
              </div>
              <a
                href={
                  w.contact.includes("@")
                    ? `mailto:${w.contact}?subject=${encodeURIComponent(`${w.itemName} is available!`)}`
                    : "#"
                }
                className="btn-ghost px-5 py-2 text-xs"
              >
                Notify
              </a>
            </div>
          ))}
        </div>
      )}
    </main>
  );
}
