"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function AdminNav({
  active,
}: {
  active: "pieces" | "requests" | "waitlist" | "reviews";
}) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }
  const tab = (href: string, label: string, key: string) => (
    <Link
      href={href}
      className={`btn-ghost ${active === key ? "!border-gold/70 !bg-gold/15 !text-marigold" : ""}`}
    >
      {label}
    </Link>
  );
  return (
    <div className="flex flex-wrap gap-2">
      {tab("/admin", "Pieces", "pieces")}
      {tab("/admin/requests", "Requests", "requests")}
      {tab("/admin/waitlist", "Waitlist", "waitlist")}
      {tab("/admin/reviews", "Reviews", "reviews")}
      <Link href="/" className="btn-ghost">
        View site
      </Link>
      <button onClick={logout} className="btn-ghost">
        Log out
      </button>
    </div>
  );
}
