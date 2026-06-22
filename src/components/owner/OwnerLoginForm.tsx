"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OwnerLoginForm() {
  const [email, setEmail] = useState("");
  const [pw, setPw] = useState("");
  const [err, setErr] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setErr("");
    const r = await fetch("/api/owners/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, password: pw }),
    });
    if (r.ok) {
      router.push("/owner");
      router.refresh();
    } else {
      const d = await r.json().catch(() => ({}));
      setErr(d.error || "Login failed.");
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="panel space-y-3 p-6">
      <label className="block">
        <span className="eyebrow mb-1 block">Email</span>
        <input type="email" className="field" value={email} onChange={(e) => setEmail(e.target.value)} />
      </label>
      <label className="block">
        <span className="eyebrow mb-1 block">Password</span>
        <input type="password" className="field" value={pw} onChange={(e) => setPw(e.target.value)} />
      </label>
      {err && <p className="text-sm text-vermilion">{err}</p>}
      <button type="submit" className="btn-primary w-full" disabled={loading}>
        {loading ? "Signing in…" : "Sign in"}
      </button>
      <p className="text-center text-sm text-cream/60">
        New here?{" "}
        <Link href="/join" className="text-gold underline">
          Open a closet
        </Link>
      </p>
    </form>
  );
}
