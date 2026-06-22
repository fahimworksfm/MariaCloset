"use client";

import { useState } from "react";
import Link from "next/link";

export default function JoinForm() {
  const [f, setF] = useState({ closet: "", name: "", email: "", password: "", bio: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "done" | "error">("idle");
  const [err, setErr] = useState("");
  const set = (k: keyof typeof f, v: string) => setF((p) => ({ ...p, [k]: v }));

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus("sending");
    setErr("");
    const r = await fetch("/api/owners/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(f),
    });
    const d = await r.json().catch(() => ({}));
    if (r.ok) setStatus("done");
    else {
      setErr(d.error || "Something went wrong.");
      setStatus("error");
    }
  }

  if (status === "done") {
    return (
      <div className="panel p-6 text-center">
        <p className="font-display text-2xl text-gold">Application sent ✓</p>
        <p className="mt-2 text-cream/70">
          We&apos;ll review {f.closet}&apos;s closet and email you when it&apos;s approved — then log
          in to add your pieces.
        </p>
        <Link href="/" className="btn-ghost mt-5">
          Back to Maria&apos;s Closet
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="panel space-y-3 p-6">
      <label className="block">
        <span className="eyebrow mb-1 block">Closet name</span>
        <input className="field" value={f.closet} onChange={(e) => set("closet", e.target.value)} placeholder="e.g. Aisha" />
      </label>
      <div className="grid gap-3 sm:grid-cols-2">
        <label className="block">
          <span className="eyebrow mb-1 block">Your name</span>
          <input className="field" value={f.name} onChange={(e) => set("name", e.target.value)} />
        </label>
        <label className="block">
          <span className="eyebrow mb-1 block">Email</span>
          <input type="email" className="field" value={f.email} onChange={(e) => set("email", e.target.value)} />
        </label>
      </div>
      <label className="block">
        <span className="eyebrow mb-1 block">Password</span>
        <input type="password" className="field" value={f.password} onChange={(e) => set("password", e.target.value)} placeholder="6+ characters" />
      </label>
      <label className="block">
        <span className="eyebrow mb-1 block">About your closet (optional)</span>
        <textarea className="field min-h-[70px]" value={f.bio} onChange={(e) => set("bio", e.target.value)} placeholder="A line about your style…" />
      </label>
      <button type="submit" className="btn-primary w-full" disabled={status === "sending"}>
        {status === "sending" ? "Sending…" : "Apply to open a closet"}
      </button>
      {status === "error" && <p className="text-sm text-vermilion">{err}</p>}
      <p className="text-center text-sm text-cream/60">
        Already approved?{" "}
        <Link href="/owner/login" className="text-gold underline">
          Log in
        </Link>
      </p>
    </form>
  );
}
