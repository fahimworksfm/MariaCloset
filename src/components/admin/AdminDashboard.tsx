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
    brand: "",
    size: "Free size",
    color: "",
    pricePerDay: 0,
    retailValue: undefined,
    description: "",
    details: [],
    image: "",
    accent: "#FF9A1F",
    unavailable: [],
  };
}

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "piece";
}

export default function AdminDashboard({ initialItems }: { initialItems: Item[] }) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(initialItems);
  const [editing, setEditing] = useState<Item | null>(null);
  const [busy, setBusy] = useState<string>("");
  const [msg, setMsg] = useState<string>("");
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!msg) return;
    const t = setTimeout(() => setMsg(""), 3500);
    return () => clearTimeout(t);
  }, [msg]);

  async function persist(next: Item[]) {
    setItems(next);
    const r = await fetch("/api/admin/items", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ items: next }),
    });
    const d = await r.json().catch(() => ({}));
    setMsg(r.ok ? (d.stored ? "Saved ✓" : "Saved (not persisted — read-only disk)") : "Save failed");
    router.refresh();
  }

  function move(i: number, dir: number) {
    const j = i + dir;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    persist(next);
  }

  function remove(item: Item) {
    if (!confirm(`Remove "${item.name}" from the rail?`)) return;
    persist(items.filter((x) => x.id !== item.id));
  }

  function saveDraft() {
    if (!editing) return;
    if (!editing.name.trim()) return setMsg("Please add a name.");
    if (!editing.image) return setMsg("Please add a photo.");
    const draft: Item = {
      ...editing,
      details: (editing.details ?? []).map((d) => d.trim()).filter(Boolean),
    };
    let next: Item[];
    if (!draft.id) {
      let id = slugify(draft.name);
      const taken = new Set(items.map((x) => x.id));
      if (taken.has(id)) id = `${id}-${Math.random().toString(36).slice(2, 6)}`;
      next = [...items, { ...draft, id }];
    } else {
      next = items.map((x) => (x.id === draft.id ? draft : x));
    }
    persist(next);
    setEditing(null);
  }

  async function onUpload(file: File) {
    if (!editing) return;
    setBusy("upload");
    const form = new FormData();
    form.append("file", file);
    const r = await fetch("/api/admin/upload", { method: "POST", body: form });
    const d = await r.json().catch(() => ({}));
    setBusy("");
    if (r.ok) setEditing({ ...editing, image: d.url });
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
    setEditing({
      ...editing,
      name: s.name || editing.name,
      category: s.category || editing.category,
      color: s.color || editing.color,
      description: s.description || editing.description,
      details: Array.isArray(s.details) ? s.details : editing.details,
      accent: /^#[0-9a-fA-F]{3,8}$/.test(s.accent) ? s.accent : editing.accent,
    });
    setMsg("AI filled the details ✦ review & save");
  }

  // Free, in-browser background removal (no API key). Runs on the visitor's
  // device, then re-uploads the transparent PNG.
  async function removeBg() {
    if (!editing?.image) return setMsg("Upload a photo first.");
    setBusy("background");
    setMsg("Removing background… (first run downloads a small model)");
    try {
      // Loaded from a CDN at runtime via new Function so the heavy WASM model
      // never enters the build (webpack can't parse onnxruntime's import.meta).
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
        setEditing((cur) => (cur ? { ...cur, image: d.url } : cur));
        setMsg("Background removed ✓");
      } else {
        setMsg(d.error || "Upload failed");
      }
    } catch {
      setMsg("Background removal failed — try a clearer photo.");
    } finally {
      setBusy("");
    }
  }

  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  const d = editing;
  const set = (patch: Partial<Item>) => editing && setEditing({ ...editing, ...patch });

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-gold-shimmer">Closet Admin</h1>
          <p className="text-sm text-cream/60">
            Upload pieces and drag the order — top to bottom = the order on the rail &amp; stage.
          </p>
        </div>
        <div className="flex gap-2">
          <Link href="/" className="btn-ghost">View site</Link>
          <button onClick={logout} className="btn-ghost">Log out</button>
        </div>
      </header>

      {msg && (
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">
          {msg}
        </div>
      )}

      {/* Editor */}
      {d ? (
        <section className="panel mt-6 p-6">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-2xl text-gold">{d.id ? "Edit piece" : "Add a piece"}</h2>
            <button onClick={() => setEditing(null)} className="text-sm text-cream/60 hover:text-gold">
              ✕ Close
            </button>
          </div>

          <div className="mt-5 grid gap-6 md:grid-cols-[260px_1fr]">
            {/* image side */}
            <div>
              <div
                className="grid aspect-[4/5] place-items-center overflow-hidden rounded-xl border border-gold/25"
                style={{ background: `radial-gradient(70% 60% at 50% 40%, ${d.accent}33, #1a0826 75%)` }}
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
                  const f = e.target.files?.[0];
                  if (f) onUpload(f);
                }}
              />
              <button
                onClick={() => fileRef.current?.click()}
                className="btn-ghost mt-3 w-full"
                disabled={busy === "upload"}
              >
                {busy === "upload" ? "Uploading…" : d.image ? "Replace photo" : "Upload photo"}
              </button>
              <div className="mt-2 grid grid-cols-1 gap-2">
                <button onClick={aiSuggest} className="btn-ghost" disabled={busy === "ai"}>
                  {busy === "ai" ? "Thinking…" : "✨ Auto-fill from photo (AI)"}
                </button>
                <button onClick={removeBg} className="btn-ghost" disabled={busy === "background"}>
                  {busy === "background" ? "Removing…" : "Remove background (free)"}
                </button>
              </div>
            </div>

            {/* fields side */}
            <div className="grid gap-3 sm:grid-cols-2">
              <Field label="Name">
                <input className="field" value={d.name} onChange={(e) => set({ name: e.target.value })} placeholder="Garad Silk Saree" />
              </Field>
              <Field label="Category">
                <input className="field" value={d.category} onChange={(e) => set({ category: e.target.value })} />
              </Field>
              <Field label="Brand">
                <input className="field" value={d.brand ?? ""} onChange={(e) => set({ brand: e.target.value })} />
              </Field>
              <Field label="Size">
                <input className="field" value={d.size} onChange={(e) => set({ size: e.target.value })} />
              </Field>
              <Field label="Colour">
                <input className="field" value={d.color} onChange={(e) => set({ color: e.target.value })} />
              </Field>
              <Field label="Price / day ($)">
                <input type="number" className="field" value={d.pricePerDay || ""} onChange={(e) => set({ pricePerDay: Number(e.target.value) })} />
              </Field>
              <Field label="Retail value ($)">
                <input type="number" className="field" value={d.retailValue ?? ""} onChange={(e) => set({ retailValue: e.target.value ? Number(e.target.value) : undefined })} />
              </Field>
              <div className="sm:col-span-2">
                <Field label="Description">
                  <textarea className="field min-h-[70px]" value={d.description} onChange={(e) => set({ description: e.target.value })} />
                </Field>
              </div>
              <div className="sm:col-span-2">
                <Field label="Details (one per line)">
                  <textarea
                    className="field min-h-[70px]"
                    value={(d.details ?? []).join("\n")}
                    onChange={(e) => set({ details: e.target.value.split("\n") })}
                    placeholder={"Pure silk\nBlouse piece included\nDry clean only"}
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

      {/* List */}
      <section className="mt-8 space-y-3">
        {items.map((item, i) => (
          <div key={item.id} className="panel flex items-center gap-4 p-3">
            <span className="w-6 text-center font-display text-lg text-gold/60">{i + 1}</span>
            <div
              className="h-16 w-14 shrink-0 overflow-hidden rounded-lg border border-gold/20"
              style={{ background: `radial-gradient(70% 60% at 50% 40%, ${item.accent}44, #1a0826 75%)` }}
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
            <div className="flex items-center gap-1">
              <button onClick={() => move(i, -1)} className="grid h-8 w-8 place-items-center rounded-full text-gold hover:bg-gold/10" aria-label="Move up">↑</button>
              <button onClick={() => move(i, 1)} className="grid h-8 w-8 place-items-center rounded-full text-gold hover:bg-gold/10" aria-label="Move down">↓</button>
              <button onClick={() => setEditing({ ...item })} className="btn-ghost px-4 py-2 text-xs">Edit</button>
              <button onClick={() => remove(item)} className="rounded-full px-3 py-2 text-xs text-rani hover:bg-rani/10">Delete</button>
            </div>
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
