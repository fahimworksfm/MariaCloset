"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

export default function OwnerNav({
  active,
  closet,
}: {
  active: "pieces" | "requests" | "reviews";
  closet: string;
}) {
  const router = useRouter();
  async function logout() {
    await fetch("/api/owners/logout", { method: "POST" });
    router.push("/");
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
    <div className="flex flex-wrap items-center gap-2">
      <Link
        href="/"
        className="inline-flex items-center rounded-full border border-gold/50 bg-gold/15 px-5 py-3 text-sm font-medium uppercase tracking-wider text-gold transition hover:bg-gold/25"
      >
        ‹ Main site
      </Link>
      <span className="mx-1 hidden h-5 w-px bg-gold/20 sm:block" />
      {tab("/owner", "Pieces", "pieces")}
      {tab("/owner/requests", "Requests", "requests")}
      {tab("/owner/reviews", "Reviews", "reviews")}
      <Link href={`/closet/${encodeURIComponent(closet)}`} className="btn-ghost">
        View closet
      </Link>
      <button onClick={logout} className="btn-ghost">
        Log out
      </button>
    </div>
  );
}
