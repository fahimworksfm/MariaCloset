import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageBand from "@/components/ImageBand";
import GiftForm from "@/components/GiftForm";
import { money } from "@/data/config";
import { getSettings } from "@/lib/settings";

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

export default async function MembershipPage() {
  const { rewards } = await getSettings();
  return (
    <>
      <div className="relative z-10">
        <Navbar />
        <ImageBand
          src="/brand/gold-sweep.jpg"
          eyebrow="For the regulars"
          title="Membership & gifts"
          as="h1"
          heightClass="h-[42vh] min-h-[300px]"
          priority
        />
        <main className="mx-auto max-w-5xl px-5 py-14">
          <div className="grid gap-5 sm:grid-cols-2">
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

          <section className="mt-16 text-center">
            <p className="eyebrow">Rewards</p>
            <h2 className="mt-3 font-display text-3xl text-cream">
              Give {money(rewards.welcomeOffer)}, get {money(rewards.referralReward)}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-cream/60">
              Invite friends for credit, and save more with every rental —{" "}
              {rewards.tiers
                .filter((t) => t.discountPct)
                .map((t) => `${t.name}s get ${t.discountPct}% off`)
                .join(", ")}
              .
            </p>
            <Link href="/refer" className="btn-ghost mt-6">
              Get your invite link
            </Link>
          </section>

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
