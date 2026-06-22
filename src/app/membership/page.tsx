import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Petals from "@/components/Petals";
import GiftForm from "@/components/GiftForm";
import { PaisleyDivider } from "@/components/Ornament";

export const metadata: Metadata = { title: "Membership & Gifts — Maria's Closet" };

const tiers = [
  {
    name: "Pay as you go",
    price: "Per rental",
    perks: ["Rent any piece by the day", "No commitment", "Request to rent anytime"],
    highlight: false,
  },
  {
    name: "Closet Pass",
    price: "Members only",
    perks: [
      "A set number of rentals each month",
      "Member discount on every rental",
      "Free local pickup & delivery",
      "Early access to new arrivals",
    ],
    highlight: true,
  },
];

export default function MembershipPage() {
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-5xl px-5 py-12">
          <p className="eyebrow text-center">For the regulars</p>
          <h1 className="mt-2 text-center font-display text-5xl text-gold-shimmer">
            Membership &amp; gifts
          </h1>
          <PaisleyDivider className="mx-auto my-6 h-7 w-40 text-gold/70" />

          <div className="mt-8 grid gap-5 sm:grid-cols-2">
            {tiers.map((t) => (
              <div
                key={t.name}
                className={`panel p-7 ${t.highlight ? "border-gold/50 shadow-glow" : ""}`}
              >
                {t.highlight && <p className="eyebrow mb-1">Most loved</p>}
                <h2 className="font-display text-3xl text-gold">{t.name}</h2>
                <p className="mt-1 text-sm text-cream/60">{t.price}</p>
                <ul className="mt-4 space-y-2 text-sm text-cream/75">
                  {t.perks.map((p) => (
                    <li key={p} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-marigold" />
                      {p}
                    </li>
                  ))}
                </ul>
                <Link href="/browse" className={`${t.highlight ? "btn-primary" : "btn-ghost"} mt-6`}>
                  {t.highlight ? "Enquire to join" : "Browse pieces"}
                </Link>
              </div>
            ))}
          </div>

          <section className="mt-16">
            <h2 className="text-center font-display text-3xl text-gold">Gift a rental</h2>
            <p className="mx-auto mt-2 max-w-md text-center text-cream/65">
              The perfect present — a credit toward something gorgeous. Create a code to share.
            </p>
            <div className="mx-auto mt-6 max-w-lg">
              <GiftForm />
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
