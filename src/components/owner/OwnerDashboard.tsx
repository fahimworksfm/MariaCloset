"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import type { Item } from "@/lib/types";
import { money } from "@/data/config";

function blankDraft(): Item {
  return {
    id: "",
    name: "",
    category: "Saree",
    size: "Free size",
    color: "",
    occasions: [],
    pricePerDay: 0,
    description: "",
    image: "",
    accent: "#A8536B",
    unavailable: [],
  };
}

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "piece";

export default function OwnerDashboard({
  closet,
  ownerName,
  initialItems,
}: {
  closet: string;
  ownerName: string;
  initialItems: Item[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [editing, setEditing] = useState<Item | null>(null);
  const [busy, setBusy] = useState("");
  const [msg, setMsg] = useState("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  async function persist(next: Item[]) {
    setItems(next);
    const r = await fetch("/api/owner/items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: next }),
    });
    const d = await r.json().catch(() => ({}));
    setMsg(r.ok ? (d.stored ? "Saved ✓" : "Saved (not persisted — connect Blob)") : "Save failed");
    router.refresh();
  }

  function saveDraft() {
    if (!editing) return;
    if (!editing.name.trim()) return setMsg("Please add a name.");
    if (!editing.image) return setMsg("Please add a photo.");
    const draft: Item = {
      ...editing,
      occasions: (editing.occasions ?? []).map((o) => o.trim()).filter(Boolean),
    };
    let next: Item[];
    if (!draft.id) {
      let id = `${slugify(closet)}-${slugify(draft.name)}`;
      const taken = new Set(items.map((x) => x.id));
      if (taken.has(id)) id = `${id}-${Math.random().toString(36).slice(2, 6)}`;
      next = [...items, { ...draft, id }];
    } else {
      next = items.map((x) => (x.id === draft.id ? draft : x));
    }
    persist(next);
    setEditing(null);
  }

  function remove(item: Item) {
    if (!confirm(`Remove "${item.name}"?`)) return;
    persist(items.filter((x) => x.id !== item.id));
  }

  async function onUpload(file: File) {
    if (!editing) return;
    setBusy("upload");
    const form = new FormData();
    form.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: form });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (r.ok) setEditing((c) => (c ? { ...c, image: d.url } : c));
    else setMsg(d.error || "Upload failed");
  }

  async function aiSuggest() {
    if (!editing?.image) return setMsg("Upload a photo first.");
    setBusy("ai");
    const r = await fetch("/api/admin/ai-suggest", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ imageUrl: editing.image }),
    });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (!r.ok) return setMsg(d.error || "AI unavailable");
    const s = d.suggestion ?? {};
    setEditing((c) =>
      c
        ? {
            ...c,
            name: s.name || c.name,
            category: s.category || c.category,
            color: s.color || c.color,
            description: s.description || c.description,
            occasions: Array.isArray(s.occasions) ? s.occasions : c.occasions,
            accent: /^#[0-9a-fA-F]{3,8}$/.test(s.accent) ? s.accent : c.accent,
          }
        : c,
    );
    setMsg("AI filled the details ✦ review & save");
  }

  async function removeBg() {
    if (!editing?.image) return setMsg("Upload a photo first.");
    setBusy("bg");
    setMsg("Removing background…");
    try {
      const cdnImport = new Function("u", "return import(u)") as (
        u: string,
      ) => Promise<{ removeBackground: (src: string) => Promise<Blob> }>;
      const mod = await cdnImport("https://esm.sh/@imgly/background-removal@1.7.0");
      const blob = await mod.removeBackground(editing.image);
      const form = new FormData();
      form.append("file", new File([blob], "cutout.png", { type: "image/png" }));
      const r = await fetch("/api/admin/upload", { method: "POST", body: form });
      const d = await r.json().catch(() => ({}));
      if (r.ok) {
        setEditing((c) => (c ? { ...c, image: d.url } : c));
        setMsg("Background removed ✓");
      } else setMsg(d.error || "Upload failed");
    } catch {
      setMsg("Background removal failed.");
    } finally {
      setBusy("");
    }
  }

  async function logout() {
    await fetch("/api/owners/logout", { method: "POST" });
    router.push("/");
    router.refresh();
  }

  const d = editing;
  const set = (patch: Partial<Item>) => editing && setEditing({ ...editing, ...patch });

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-gold-shimmer">{closet}&apos;s closet</h1>
          <p className="text-sm text-cream/60">Welcome, {ownerName} — manage your pieces here.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Link
            href="/"
            className="inline-flex items-center rounded-full border border-gold/50 bg-gold/15 px-5 py-3 text-sm font-medium uppercase tracking-wider text-gold transition hover:bg-gold/25"
          >
            ‹ Main site
          </Link>
          <Link href={`/closet/${encodeURIComponent(closet)}`} className="btn-ghost">
            View my closet
          </Link>
          <button onClick={logout} className="btn-ghost">
            Log out
          </button>
        </div>
      </header>

      {msg && (
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">
          {msg}
        </div>
      )}

      {d ? (
        <section className="panel mt-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-gold">{d.id ? "Edit piece" : "Add a piece"}</h2>
            <button onClick={() => setEditing(null)} className="text-sm text-cream/60 hover:text-gold">
              ✕ Close
            </button>
          </div>
          <div className="mt-5 grid gap-6 md:grid-cols-[240px_1fr]">
            <div>
              <div
                className="grid aspect-[4/5] place-items-center overflow-hidden rounded-xl border border-gold/25"
                style={{ background: `radial-gradient(70% 60% at 50% 40%, ${d.accent}33, #160a12 75%)` }}
              >
                {d.image ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={d.image} alt="" className="h-full w-full object-contain" />
                ) : (
                  <span className="text-sm text-cream/40">No photo yet</span>
                )}
              </div>
              <input
                ref={fileRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) onUpload(file);
                }}
              />
              <button onClick={() => fileRef.current?.click()} className="btn-ghost mt-3 w-full" disabled={busy === "upload"}>
                {busy === "upload" ? "Uploading…" : d.image ? "Replace photo" : "Upload photo"}
              </button>
              <button onClick={aiSuggest} className="btn-ghost mt-2 w-full" disabled={busy === "ai"}>
                {busy === "ai" ? "Thinking…" : "✨ Auto-fill from photo"}
              </button>
              <button onClick={removeBg} className="btn-ghost mt-2 w-full" disabled={busy === "bg"}>
                {busy === "bg" ? "Removing…" : "Remove background (free)"}
              </button>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input className="field" value={d.name} onChange={(e) => set({ name: e.target.value })} />
              </Field>
              <Field label="Category">
                <input className="field" value={d.category} onChange={(e) => set({ category: e.target.value })} />
              </Field>
              <Field label="Price / day ($)">
                <input type="number" className="field" value={d.pricePerDay || ""} onChange={(e) => set({ pricePerDay: Number(e.target.value) })} />
              </Field>
              <Field label="Size">
                <input className="field" value={d.size} onChange={(e) => set({ size: e.target.value })} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea className="field min-h-[70px]" value={d.description} onChange={(e) => set({ description: e.target.value })} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Occasions (one per line)">
                  <textarea
                    className="field min-h-[60px]"
                    value={(d.occasions ?? []).join("\n")}
                    onChange={(e) => set({ occasions: e.target.value.split("\n") })}
                    placeholder={"Wedding\nReception"}
                  />
                </Field>
              </div>
              <Field label="Stage / glow colour">
                <div className="flex items-center gap-2">
                  <input type="color" value={d.accent} onChange={(e) => set({ accent: e.target.value })} className="h-10 w-12 rounded border border-gold/25 bg-transparent" />
                  <input className="field" value={d.accent} onChange={(e) => set({ accent: e.target.value })} />
                </div>
              </Field>
            </div>
          </div>
          <div className="mt-5 flex gap-3">
            <button onClick={saveDraft} className="btn-primary">Save piece</button>
            <button onClick={() => setEditing(null)} className="btn-ghost">Cancel</button>
          </div>
        </section>
      ) : (
        <button onClick={() => setEditing(blankDraft())} className="btn-primary mt-6">
          + Add a piece
        </button>
      )}

      <section className="mt-8 space-y-3">
        {items.map((item) => (
          <div key={item.id} className="panel flex items-center gap-4 p-3">
            <div
              className="h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-gold/20"
              style={{ background: `radial-gradient(70% 60% at 50% 40%, ${item.accent}44, #160a12 75%)` }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.image} alt="" className="h-full w-full object-contain" />
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate font-display text-lg text-cream">{item.name}</p>
              <p className="truncate text-sm text-cream/60">
                {item.category} · {money(item.pricePerDay)}/day
              </p>
            </div>
            <button onClick={() => setEditing({ ...item })} className="btn-ghost px-4 py-2 text-xs">Edit</button>
            <button onClick={() => remove(item)} className="rounded-full px-3 py-2 text-xs text-rani hover:bg-rani/10">Delete</button>
          </div>
        ))}
        {items.length === 0 && (
          <p className="py-10 text-center text-cream/50">No pieces yet — add your first above.</p>
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
