"use client";

import { useRef, useState, type ReactNode } from "react";
import { uploadMedia } from "@/lib/uploadMedia";
import { siteConfig, type RewardTier, type Settings } from "@/data/config";
import AdminNav from "./AdminNav";

/** Everything that used to be hard-coded in src/data/config.ts. */
export default function AdminSettings({ initial }: { initial: Settings }) {
  const [s, setS] = useState<Settings>(initial);
  const [saved, setSaved] = useState(JSON.stringify(initial));
  const [msg, setMsg] = useState("");
  const [busy, setBusy] = useState<"" | "save" | "video">("");
  const vidRef = useRef<HTMLInputElement>(null);

  const site = (patch: Partial<Settings["site"]>) => setS((c) => ({ ...c, site: { ...c.site, ...patch } }));
  const rewards = (patch: Partial<Settings["rewards"]>) =>
    setS((c) => ({ ...c, rewards: { ...c.rewards, ...patch } }));
  const tier = (i: number, patch: Partial<RewardTier>) =>
    rewards({ tiers: s.rewards.tiers.map((t, j) => (j === i ? { ...t, ...patch } : t)) });
  const dirty = JSON.stringify(s) !== saved;

  async function save() {
    setBusy("save");
    setMsg("");
    const r = await fetch("/api/admin/settings", {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(s),
    }).catch(() => null);
    const d = await r?.json().catch(() => ({}));
    setBusy("");
    if (r?.ok && d.stored) {
      setS(d.settings);
      setSaved(JSON.stringify(d.settings));
      setMsg("Saved ✓ — live on the site now");
    } else setMsg(d?.error || "Not saved — the database didn't accept it");
  }

  async function uploadVideo(file: File) {
    setBusy("video");
    const d = await uploadMedia(file, "site");
    setBusy("");
    if ("url" in d) site({ heroVideo: d.url });
    else setMsg(d.error);
  }

  return (
    <main className="relative z-10 mx-auto max-w-5xl px-5 py-8">
      <header className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-4xl text-gold-shimmer">Settings</h1>
          <p className="text-sm text-cream/60">Site copy, contact and the rewards programme.</p>
        </div>
        <AdminNav active="settings" />
      </header>

      {msg && (
        <div className="mt-4 rounded-xl border border-gold/30 bg-gold/10 px-4 py-2 text-sm text-gold">{msg}</div>
      )}

      <section className="panel mt-6 p-6">
        <h2 className="font-display text-2xl text-gold">Site</h2>
        <div className="mt-5 grid gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <Field label="Tagline" hint="The big homepage headline, also used in the browser tab.">
              <input className="field" value={s.site.tagline} maxLength={120} onChange={(e) => site({ tagline: e.target.value })} />
            </Field>
          </div>
          <div className="sm:col-span-2">
            <Field label="Description" hint="Under the headline, and in search results and link previews.">
              <textarea
                className="field min-h-[80px]"
                value={s.site.description}
                maxLength={600}
                onChange={(e) => site({ description: e.target.value })}
              />
            </Field>
          </div>
          <Field label="Owner email" hint="New requests are emailed here. Leave empty to turn off.">
            <input
              className="field"
              type="email"
              value={s.site.ownerEmail}
              placeholder="maria@example.com"
              onChange={(e) => site({ ownerEmail: e.target.value })}
            />
          </Field>
          <Field label="Homepage video" hint="A muted loop behind the headline. MP4/WebM, up to 50MB.">
            <div className="flex flex-wrap items-center gap-2">
              <input
                ref={vidRef}
                type="file"
                accept="video/mp4,video/webm"
                className="hidden"
                onChange={(e) => {
                  const f = e.target.files?.[0];
                  if (f) uploadVideo(f);
                  e.target.value = "";
                }}
              />
              <button type="button" onClick={() => vidRef.current?.click()} className="btn-ghost" disabled={busy === "video"}>
                {busy === "video" ? "Uploading…" : s.site.heroVideo ? "Replace video" : "Upload video"}
              </button>
              {s.site.heroVideo && (
                <button
                  type="button"
                  onClick={() => site({ heroVideo: "" })}
                  className="rounded-full px-3 py-2 text-xs text-rani hover:bg-rani/10"
                >
                  Remove
                </button>
              )}
            </div>
          </Field>
          {s.site.heroVideo && (
            <div className="sm:col-span-2">
              <video
                key={s.site.heroVideo}
                src={s.site.heroVideo}
                muted
                loop
                autoPlay
                playsInline
                className="aspect-video w-full max-w-sm rounded-xl border border-gold/25 bg-night object-cover"
              />
            </div>
          )}
        </div>
      </section>

      <section className="panel mt-6 p-6">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 className="font-display text-2xl text-gold">Rewards</h2>
          <label className="flex cursor-pointer items-center gap-2 text-sm text-cream/80">
            <input
              type="checkbox"
              checked={s.rewards.enabled}
              onChange={(e) => rewards({ enabled: e.target.checked })}
              className="h-4 w-4 accent-[#ECE7DD]"
            />
            Programme on
          </label>
        </div>
        <p className="mt-1 text-xs text-cream/50">
          Applied when you approve a request. Changes apply to requests approved from now on.
        </p>

        <fieldset disabled={!s.rewards.enabled} className="mt-5 grid gap-4 disabled:opacity-50 sm:grid-cols-3">
          <Field label="Welcome offer ($)" hint="Off a referred friend's first rental.">
            <input
              className="field"
              type="number"
              min={0}
              value={s.rewards.welcomeOffer}
              onChange={(e) => rewards({ welcomeOffer: Number(e.target.value) })}
            />
          </Field>
          <Field label="Referral reward ($)" hint="Credit to the inviter once it's confirmed.">
            <input
              className="field"
              type="number"
              min={0}
              value={s.rewards.referralReward}
              onChange={(e) => rewards({ referralReward: Number(e.target.value) })}
            />
          </Field>
          <Field label="Which pieces" hint="Whose pieces honour rewards.">
            <select
              className="field"
              value={s.rewards.scope}
              onChange={(e) => rewards({ scope: e.target.value === "all" ? "all" : "maria" })}
            >
              <option value="maria">{siteConfig.ownerName}&apos;s closet only</option>
              <option value="all">Every closet</option>
            </select>
          </Field>

          <div className="sm:col-span-3">
            <span className="eyebrow mb-2 block">Loyalty tiers</span>
            <div className="space-y-2">
              <div className="grid grid-cols-[minmax(0,1fr)_76px_64px_20px] sm:grid-cols-[minmax(0,1fr)_110px_110px_32px] gap-2 text-[11px] text-cream/45">
                <span>Name</span>
                <span>After rentals</span>
                <span>% off</span>
                <span />
              </div>
              {s.rewards.tiers.map((t, i) => (
                <div key={i} className="grid grid-cols-[minmax(0,1fr)_76px_64px_20px] sm:grid-cols-[minmax(0,1fr)_110px_110px_32px] items-center gap-2">
                  <input className="field" value={t.name} maxLength={30} onChange={(e) => tier(i, { name: e.target.value })} />
                  <input
                    className="field"
                    type="number"
                    min={0}
                    value={t.minRentals}
                    disabled={i === 0}
                    title={i === 0 ? "Everyone starts here" : undefined}
                    onChange={(e) => tier(i, { minRentals: Number(e.target.value) })}
                  />
                  <input
                    className="field"
                    type="number"
                    min={0}
                    max={90}
                    value={t.discountPct}
                    onChange={(e) => tier(i, { discountPct: Number(e.target.value) })}
                  />
                  {i > 0 ? (
                    <button
                      type="button"
                      aria-label={`Remove ${t.name}`}
                      onClick={() => rewards({ tiers: s.rewards.tiers.filter((_, j) => j !== i) })}
                      className="text-sm text-cream/50 hover:text-rani"
                    >
                      ✕
                    </button>
                  ) : (
                    <span />
                  )}
                </div>
              ))}
            </div>
            {s.rewards.tiers.length < 8 && (
              <button
                type="button"
                className="btn-ghost mt-3"
                onClick={() => {
                  const last = s.rewards.tiers[s.rewards.tiers.length - 1];
                  rewards({
                    tiers: [
                      ...s.rewards.tiers,
                      { name: "New tier", minRentals: (last?.minRentals ?? 0) + 3, discountPct: (last?.discountPct ?? 0) + 5 },
                    ],
                  });
                }}
              >
                + Add a tier
              </button>
            )}
          </div>
        </fieldset>
      </section>

      <div className="sticky bottom-4 z-20 mt-6 flex w-fit items-center gap-3 rounded-full border border-gold/20 bg-night/90 p-1.5 backdrop-blur">
        <button onClick={save} className="btn-primary" disabled={busy !== "" || !dirty}>
          {busy === "save" ? "Saving…" : dirty ? "Save settings" : "Saved"}
        </button>
        {dirty && (
          <button onClick={() => setS(JSON.parse(saved))} className="btn-ghost">
            Discard changes
          </button>
        )}
      </div>
    </main>
  );
}

function Field({ label, hint, children }: { label: string; hint?: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="eyebrow mb-1 block">{label}</span>
      {children}
      {hint && <span className="mt-1 block text-[11px] leading-snug text-cream/40">{hint}</span>}
    </label>
  );
}
