import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import ImageBand from "@/components/ImageBand";
import ReferForm from "@/components/ReferForm";
import { money, siteConfig } from "@/data/config";
import { getSettings } from "@/lib/settings";

export async function generateMetadata(): Promise<Metadata> {
  const { rewards } = await getSettings();
  return {
    title: "Invite a friend — Maria's Closet",
    description: `Give ${money(rewards.welcomeOffer)}, get ${money(rewards.referralReward)}. Plus rewards that grow with every rental.`,
  };
}

export default async function ReferPage() {
  const { rewards } = await getSettings();
  const welcome = money(rewards.welcomeOffer);
  const reward = money(rewards.referralReward);
  const steps = [
    { n: "01", title: "Share your link", body: "Send it to a friend who'd love something beautiful to wear." },
    { n: "02", title: `They get ${welcome} off`, body: "Taken off their first rental, when it's confirmed." },
    { n: "03", title: `You get ${reward} credit`, body: "Added once their rental is confirmed, and applied to your next one." },
  ];
  const tiers = rewards.tiers;

  return (
    <div className="relative z-10">
      <Navbar />
      <ImageBand
        src="/brand/og-silk.jpg"
        eyebrow="Rewards"
        title={`Give ${welcome}, get ${reward}`}
        subtitle="Share the closet with a friend — and enjoy more with every rental."
        as="h1"
        heightClass="h-[42vh] min-h-[300px]"
        priority
      />

      <main className="mx-auto max-w-4xl px-5 py-14">
        <div className="grid gap-px overflow-hidden rounded-xl border border-cream/10 bg-cream/10 sm:grid-cols-3">
          {steps.map((s) => (
            <div key={s.n} className="bg-night p-7">
              <span className="font-display text-3xl font-light text-cream/40">{s.n}</span>
              <h2 className="mt-4 font-display text-xl text-cream">{s.title}</h2>
              <p className="mt-2 text-sm text-cream/55">{s.body}</p>
            </div>
          ))}
        </div>

        <section className="panel mx-auto mt-10 max-w-2xl p-6 sm:p-8">
          <h2 className="font-display text-2xl text-cream">Get your invite link</h2>
          <p className="mb-6 mt-1 text-sm text-cream/55">It only takes a moment, and your link never changes.</p>
          <ReferForm welcomeOffer={rewards.welcomeOffer} />
        </section>

        <section className="mt-20">
          <p className="eyebrow text-center">Loyalty</p>
          <h2 className="mt-3 text-center font-display text-4xl font-light text-cream">
            The more you rent, the more you save
          </h2>
          <div className="mt-10 grid gap-px overflow-hidden rounded-xl border border-cream/10 bg-cream/10 sm:grid-cols-3">
            {tiers.map((t) => (
              <div key={t.name} className="bg-night p-7">
                <h3 className="font-display text-2xl text-cream">{t.name}</h3>
                <p className="mt-1 text-sm text-cream/50">
                  {t.minRentals === 0 ? "From your first rental" : `After ${t.minRentals} rentals`}
                </p>
                <p className="mt-5 font-sans text-3xl font-semibold text-cream">
                  {t.discountPct ? `${t.discountPct}% off` : "Invites & credit"}
                </p>
                <p className="mt-1 text-xs text-cream/45">
                  {t.discountPct ? "every rental, automatically" : `${welcome} for friends, ${reward} for you`}
                </p>
              </div>
            ))}
          </div>
          <p className="mx-auto mt-6 max-w-xl text-center text-xs leading-relaxed text-cream/45">
            Rewards are matched to the email or phone you rent with and applied automatically when{" "}
            {siteConfig.ownerName} confirms a rental.
            {rewards.scope === "maria" ? ` They apply to pieces from ${siteConfig.ownerName}'s closet.` : ""}
          </p>
        </section>
      </main>
      <Footer />
    </div>
  );
}
