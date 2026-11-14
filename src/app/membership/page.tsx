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
  const discounts = rewards.tiers
    .filter((t) => t.discountPct)
    .map((t) => `${t.name}s get ${t.discountPct}% off`)
    .join(", ");
  return (
    <div className="relative z-10">
      <Navbar />
      <ImageBand
        src="/brand/gold-sweep.jpg"
        eyebrow="For the regulars"
        title="Membership & gifts"
        as="h1"
        heightClass="h-[48vh] min-h-[340px]"
        priority
      />
      <main>
        <div className="mx-auto grid max-w-7xl gap-5 px-5 pt-14 sm:px-8 md:grid-cols-2">
          {tiers.map((t) => (
            <div
              key={t.name}
              className={`flex flex-col border p-8 sm:p-10 ${t.highlight ? "border-brass bg-aubergine" : "border-line"}`}
            >
              {t.highlight && <p className="kicker mb-3">Most loved</p>}
              <h2 className="font-display text-4xl font-light text-zari">{t.name}</h2>
              <p className="mt-2 text-sm text-mute">{t.price}</p>
              <ul className="mt-6 border-b border-line text-[15px] text-cream">
                {t.perks.map((p) => (
                  <li key={p} className="border-t border-line py-3.5">
                    {p}
                  </li>
                ))}
              </ul>
              <div className="mt-auto pt-8">
                <Link href="/browse" className={t.highlight ? "btn-accent" : "btn-ghost"}>
                  {t.highlight ? "Enquire to join" : "Browse pieces"}
                </Link>
              </div>
            </div>
          ))}
        </div>

          <section className="mt-24 bg-aubergine">
            <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-8 px-5 py-20 sm:px-8">
              <div>
                <p className="kicker">Rewards</p>
                <h2 className="headline mt-4 text-[clamp(2.5rem,6vw,5rem)] leading-[0.95]">
                  Give {money(rewards.welcomeOffer)},{" "}
                  <em className="italic">get {money(rewards.referralReward)}</em>
                </h2>
                <p className="mt-5 max-w-md leading-relaxed text-mute">
                  Invite friends for credit, and save more with every rental{discounts ? `. ${discounts}.` : "."}
                </p>
              </div>
              <Link href="/refer" className="btn-ghost">
                Get your invite link
              </Link>
            </div>
          </section>

        <section className="mx-auto grid max-w-7xl gap-12 px-5 pt-24 sm:px-8 lg:grid-cols-2">
          <div>
            <h2 className="headline text-[clamp(2.5rem,5vw,4rem)] leading-[0.98]">
              Gift a <em className="italic">rental</em>
            </h2>
            <p className="mt-5 max-w-sm leading-relaxed text-mute">
              The perfect present: a credit toward something gorgeous. Create a code to share.
            </p>
          </div>
          <GiftForm />
        </section>
      </main>
      <Footer />
    </div>
  );
}
