"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";
import { useRouter } from "next/navigation";
import type { LookEntry } from "@/data/lookbook";
import AdminNav from "./AdminNav";

type PieceRef = { id: string; name: string };

function blankDraft(): LookEntry {
  return { id: "", kicker: "", title: "", caption: "", accent: "#A8536B", image: "", video: "", itemId: "" };
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "look";

export default function AdminLookbook({
  initial,
  pieces,
  endpoint = "/api/admin/lookbook",
  nav,
}: {
  initial: LookEntry[];
  pieces: PieceRef[];
  endpoint?: string;
  nav?: ReactNode;
}) {
  const router = useRouter();
  const [entries, setEntries] = useState<LookEntry[]>(initial);
  const [editing, setEditing] = useState<LookEntry | null>(null);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const imgRef = useRef<HTMLInputElement>(null);
  const vidRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  async function persist(next: LookEntry[]) {
    setEntries(next);
    const r = await fetch(endpoint, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ entries: next }),
    });
    const d = await r.json().catch(() => ({}));
    setMsg(r.ok ? (d.stored ? "Saved ✓" : "Saved (not persisted — connect Blob)") : "Save failed");
    router.refresh();
  }

  function move(i: number, dir: number) {
    const j = i + dir;
    if (j < 0 || j >= entries.length) return;
    const next = [...entries];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
  }

  function remove(entry: LookEntry) {
    if (!confirm(`Remove the "${entry.title}" tile?`)) return;
    persist(entries.filter((x) => x.id !== entry.id));
  }

  function saveDraft() {
    if (!editing) return;
    if (!editing.title.trim()) return setMsg("Please add a title.");
    const draft: LookEntry = { ...editing, title: editing.title.trim() };
    let next: LookEntry[];
    if (!draft.id) {
      let id = slugify(draft.title);
      const taken = new Set(entries.map((x) => x.id));
      if (taken.has(id)) id = `${id}-${Math.random().toString(36).slice(2, 6)}`;
      next = [...entries, { ...draft, id }];
    } else {
      next = entries.map((x) => (x.id === draft.id ? draft : x));
    }
    persist(next);
    setEditing(null);
  }

  async function upload(file: File, field: "image" | "video") {
    setBusy(field);
    const form = new FormData();
    form.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: form });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (r.ok) setEditing((c) => (c ? { ...c, [field]: d.url } : c));
    else setMsg(d.error || "Upload failed");
  }

  const d = editing;
  const set = (patch: Partial<LookEntry>) => editing && setEditing({ ...editing, ...patch });

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-gold-shimmer">Lookbook</h1>
          <p className="text-sm text-cream/60">
            The &ldquo;The Edit&rdquo; section on the homepage. First tile is the large feature; drag the
            order with ↑ ↓. Five tiles read best.
          </p>
        </div>
        {nav ?? <AdminNav active="lookbook" />}
      </header>

      {msg && (
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">
          {msg}
        </div>
      )}

      {d ? (
        <section className="panel mt-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-gold">{d.id ? "Edit tile" : "Add a tile"}</h2>
            <button onClick={() => setEditing(null)} className="text-sm text-cream/60 hover:text-gold">
              ✕ Close
            </button>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-[260px_1fr]">
            {/* media side */}
            <div>
              <div
                className="relative grid aspect-[4/5] place-items-center overflow-hidden rounded-xl border border-gold/25"
                style={{ background: `radial-gradient(90% 80% at 50% 30%, ${d.accent}44, #160a12 78%)` }}
              >
                {d.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.image} alt="" className="h-full w-full object-cover" />
                ) : (
                  <span className="px-4 text-center font-display text-2xl text-cream/25">{d.title || "Preview"}</span>
                )}
                <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/85 via-night/10 to-transparent" />
                <div className="absolute inset-x-0 bottom-0 p-4">
                  {d.kicker && <p className="eyebrow">{d.kicker}</p>}
                  <p className="font-display text-xl text-cream">{d.title || "Tile title"}</p>
                </div>
                {d.video && (
                  <span className="absolute right-2 top-2 rounded-full border border-gold/30 bg-night/60 px-2 py-0.5 text-[10px] text-gold">
                    ▶ clip
                  </span>
                )}
              </div>

              <input
                ref={imgRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f, "image");
                }}
              />
              <button onClick={() => imgRef.current?.click()} className="btn-ghost mt-3 w-full" disabled={busy === "image"}>
                {busy === "image" ? "Uploading…" : d.image ? "Replace photo" : "Upload photo"}
              </button>

              <input
                ref={vidRef}
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) upload(f, "video");
                }}
              />
              <button onClick={() => vidRef.current?.click()} className="btn-ghost mt-2 w-full" disabled={busy === "video"}>
                {busy === "video" ? "Uploading…" : d.video ? "Replace hover video" : "＋ Hover video (optional)"}
              </button>
              {d.video && (
                <button
                  onClick={() => set({ video: "" })}
                  className="mt-1 w-full rounded-full px-3 py-2 text-xs text-rani hover:bg-rani/10"
                >
                  Remove clip
                </button>
              )}
              <p className="mt-1 text-[11px] leading-snug text-cream/40">
                Photo fills the tile; the optional clip plays on hover. MP4/WebM, up to 4.5MB.
              </p>
            </div>

            {/* fields side */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Kicker (small label)">
                <input className="field" value={d.kicker} onChange={(e) => set({ kicker: e.target.value })} placeholder="Wedding season" />
              </Field>
              <Field label="Title">
                <input className="field" value={d.title} onChange={(e) => set({ title: e.target.value })} placeholder="The Grand Entrance" />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Caption">
                  <textarea className="field min-h-[60px]" value={d.caption} onChange={(e) => set({ caption: e.target.value })} placeholder="Heirloom silks for the day everyone remembers." />
                </Field>
              </div>
              <Field label="Links to piece (optional)">
                <select
                  className="field"
                  value={d.itemId ?? ""}
                  onChange={(e) => set({ itemId: e.target.value || undefined })}
                >
                  <option value="">— none —</option>
                  {pieces.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Accent / plate colour">
                <div className="flex items-center gap-2">
                  <input type="color" value={d.accent} onChange={(e) => set({ accent: e.target.value })} className="h-10 w-12 rounded border border-gold/25 bg-transparent" />
                  <input className="field" value={d.accent} onChange={(e) => set({ accent: e.target.value })} />
                </div>
              </Field>
            </div>
          </div>

          <div className="mt-5 flex gap-3">
            <button onClick={saveDraft} className="btn-primary">Save tile</button>
            <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
          </div>
        </section>
      ) : (
        <button onClick={() => setEditing(blankDraft())} className="btn-primary mt-6">
          + Add a tile
        </button>
      )}

      <section className="mt-8 space-y-3">
        {entries.map((entry, i) => (
          <div key={entry.id} className="panel flex items-center gap-4 p-3">
            <span className="w-6 text-center font-display text-lg text-gold/60">{i + 1}</span>
            <div
              className="relative h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-gold/20"
              style={{ background: `radial-gradient(80% 70% at 50% 30%, ${entry.accent}55, #160a12 78%)` }}
            >
              {entry.image && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={entry.image} alt="" className="h-full w-full object-cover" />
              )}
              {entry.video && (
                <span className="absolute bottom-0.5 right-0.5 text-[9px] text-gold">▶</span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg text-cream">{entry.title}</p>
              <p className="truncate text-sm text-cream/60">
                {entry.kicker || "—"}
                {i === 0 ? " · feature tile" : ""}
              </p>
            </div>
            <div className="flex items-center gap-1">
              <button onClick={() => move(i, -1)} className="grid h-8 w-8 place-items-center rounded-full text-gold hover:bg-gold/10" aria-label="Move up">↑</button>
              <button onClick={() => move(i, 1)} className="grid h-8 w-8 place-items-center rounded-full text-gold hover:bg-gold/10" aria-label="Move down">↓</button>
              <button onClick={() => setEditing({ ...entry })} className="btn-ghost px-4 py-2 text-xs">Edit</button>
              <button onClick={() => remove(entry)} className="rounded-full px-3 py-2 text-xs text-rani hover:bg-rani/10">Delete</button>
            </div>
          </div>
        ))}
        {entries.length === 0 && (
          <p className="py-10 text-center text-cream/50">No tiles yet — add your first above.</p>
        )}
      </section>
    </main>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow mb-1 block">{label}</span>
      {children}
    </label>
  );
}
