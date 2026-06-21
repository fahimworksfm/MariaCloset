"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LotusMark } from "@/components/Ornament";

export default function AdminLogin() {
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const r = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password: pw }),
    });
    if (r.ok) {
      router.refresh();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || "Wrong password.");
      setLoading(false);
    }
  }

  return (
    <main className="relative z-10 grid min-h-screen place-items-center px-5">
      <form onSubmit={submit} className="panel w-full max-w-sm p-8 text-center">
        <span className="mx-auto grid h-12 w-12 place-items-center rounded-full bg-gradient-to-br from-rani to-marigold shadow-glow-pink">
          <LotusMark className="h-6 w-6 text-white" />
        </span>
        <h1 className="mt-4 font-display text-3xl text-gold-shimmer">Closet Admin</h1>
        <p className="mt-1 text-sm text-cream/60">Enter the password to manage the rail.</p>
        <input
          type="password"
          className="field mt-6"
          value={pw}
          onChange={(e) => setPw(e.target.value)}
          placeholder="Password"
          autoFocus
        />
        {err && <p className="mt-2 text-sm text-rani">{err}</p>}
        <button type="submit" className="btn-primary mt-5 w-full" disabled={loading}>
          {loading ? "Checking…" : "Enter"}
        </button>
      </form>
    </main>
  );
}
