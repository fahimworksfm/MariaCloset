"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { money } from "@/data/config";

type PickCard = { id: string; name: string; image: string; category: string; pricePerDay: number; why: string };
type Msg = { role: "user" | "assistant"; content: string; picks?: PickCard[] };

const STORE = "mc_stylist";
const STARTERS = [
  "A wedding-guest look under $50 a day",
  "Something elegant for a reception",
  "An easy outfit for a daytime brunch",
];

/** Floating AI stylist: a chat that recommends real pieces from the closet. */
export default function Stylist() {
  const pathname = usePathname() ?? "/";
  const hidden = pathname.startsWith("/admin") || pathname.startsWith("/owner");
  const itemId = pathname.match(/^\/items\/([^/]+)/)?.[1];

  const [open, setOpen] = useState(false);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const launcher = useRef<HTMLButtonElement>(null);
  const field = useRef<HTMLInputElement>(null);
  const scroller = useRef<HTMLDivElement>(null);
  const wasOpen = useRef(false);

  // Keep the conversation for this browser session. Saving waits until the
  // first load, so an empty initial state can never overwrite a stored chat.
  useEffect(() => {
    try {
      setMsgs(JSON.parse(sessionStorage.getItem(STORE) || "[]"));
    } catch {
      /* ignore */
    }
    setLoaded(true);
  }, []);
  useEffect(() => {
    if (!loaded) return;
    try {
      sessionStorage.setItem(STORE, JSON.stringify(msgs.slice(-20)));
    } catch {
      /* ignore */
    }
    scroller.current?.scrollTo({ top: scroller.current.scrollHeight, behavior: "smooth" });
  }, [msgs, busy, loaded]);

  useEffect(() => {
    if (!open) {
      // Back to the launcher once it has re-mounted (it isn't rendered while open).
      if (wasOpen.current) launcher.current?.focus();
      return;
    }
    wasOpen.current = true;
    field.current?.focus();
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open]);

  const close = () => setOpen(false);

  async function send(text: string) {
    const content = text.trim();
    if (!content || busy) return;
    const next: Msg[] = [...msgs, { role: "user", content }];
    setMsgs(next);
    setInput("");
    setBusy(true);
    try {
      const r = await fetch("/api/stylist", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          itemId,
          messages: next.map(({ role, content }) => ({ role, content })),
        }),
      });
      const d = await r.json().catch(() => ({}));
      setMsgs((m) => [
        ...m,
        r.ok
          ? { role: "assistant", content: d.reply, picks: d.picks }
          : { role: "assistant", content: d.error || "Sorry — I couldn't answer just now. Try again in a moment." },
      ]);
    } catch {
      setMsgs((m) => [...m, { role: "assistant", content: "I can't reach the closet right now. Check your connection and try again." }]);
    } finally {
      setBusy(false);
    }
  }

  if (hidden) return null;

  if (!open) {
    return (
      <button
        ref={launcher}
        onClick={() => setOpen(true)}
        aria-haspopup="dialog"
        className="fixed bottom-5 right-5 z-50 rounded-full bg-cream px-5 py-3 text-xs font-medium uppercase tracking-[0.2em] text-night shadow-panel transition hover:opacity-90"
      >
        Ask the stylist
      </button>
    );
  }

  const starters = itemId ? ["What goes with this piece?", ...STARTERS.slice(0, 2)] : STARTERS;

  return (
    <div
      role="dialog"
      aria-label="Stylist chat"
      className="fixed inset-x-3 bottom-3 z-50 flex h-[min(620px,calc(100dvh_-_5rem))] flex-col rounded-2xl border border-cream/15 bg-night shadow-panel sm:inset-x-auto sm:bottom-5 sm:right-5 sm:w-[400px]"
    >
      <div className="flex items-start justify-between gap-3 border-b border-cream/10 px-5 py-4">
        <div>
          <p className="font-display text-xl text-cream">Stylist</p>
          <p className="text-xs text-cream/50">Tell me the occasion, budget and vibe.</p>
        </div>
        <div className="flex items-center gap-3">
          {msgs.length > 0 && (
            <button onClick={() => setMsgs([])} className="text-xs text-cream/45 transition hover:text-cream">
              New chat
            </button>
          )}
          <button onClick={close} aria-label="Close stylist" className="text-lg leading-none text-cream/60 transition hover:text-cream">
            ×
          </button>
        </div>
      </div>

      <div ref={scroller} className="flex-1 space-y-4 overflow-y-auto px-5 py-4" aria-live="polite">
        {msgs.length === 0 && (
          <div>
            <p className="text-sm text-cream/70">
              I know every piece in the closet. Describe what you&apos;re dressing for and I&apos;ll pull a few
              options.
            </p>
            <div className="mt-4 flex flex-col items-start gap-2">
              {starters.map((s) => (
                <button key={s} onClick={() => send(s)} className="chip text-left text-xs hover:bg-cream/5">
                  {s}
                </button>
              ))}
            </div>
          </div>
        )}

        {msgs.map((m, i) =>
          m.role === "user" ? (
            <p key={i} className="ml-auto w-fit max-w-[85%] rounded-2xl bg-cream/10 px-4 py-2 text-sm text-cream">
              {m.content}
            </p>
          ) : (
            <div key={i} className="max-w-[95%]">
              <p className="text-sm leading-relaxed text-cream/85">{m.content}</p>
              {m.picks && m.picks.length > 0 && (
                <div className="mt-3 space-y-2">
                  {m.picks.map((p) => (
                    <Link
                      key={p.id}
                      href={`/items/${p.id}`}
                      className="flex gap-3 rounded-xl border border-cream/10 p-2 transition hover:border-cream/30"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={p.image} alt="" className="h-[72px] w-14 shrink-0 bg-white/[0.03] object-cover" />
                      <div className="min-w-0 py-0.5">
                        <p className="truncate font-display text-base text-cream">{p.name}</p>
                        <p className="text-xs text-cream/50">
                          {p.category} · {money(p.pricePerDay)} / day
                        </p>
                        {p.why && <p className="mt-1 line-clamp-2 text-xs text-cream/65">{p.why}</p>}
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          ),
        )}
        {busy && <p className="text-xs text-cream/45">Pulling a few pieces…</p>}
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          send(input);
        }}
        className="flex items-center gap-2 border-t border-cream/10 p-3"
      >
        <input
          ref={field}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          maxLength={600}
          placeholder="e.g. a red saree for a winter wedding"
          aria-label="Message the stylist"
          className="field flex-1 py-2.5"
        />
        <button type="submit" disabled={busy || !input.trim()} className="btn-primary px-4 py-2.5">
          Send
        </button>
      </form>
    </div>
  );
}
