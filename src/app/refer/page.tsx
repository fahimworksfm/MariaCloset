import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
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
      <main>
        <section className="mx-auto grid max-w-7xl items-end gap-12 px-5 pb-20 pt-16 sm:px-8 lg:grid-cols-[1.25fr_1fr]">
          <div>
            <p className="kicker">Rewards</p>
            <h1 className="headline mt-6 text-[clamp(3.5rem,9vw,8.25rem)] leading-[0.88]">
              Give {welcome}, <em className="italic text-brass">get {reward}</em>
            </h1>
            <p className="mt-7 max-w-md text-[17px] leading-relaxed text-cream/85">
              Share the closet with a friend, and enjoy more with every rental.
            </p>
          </div>
          <div className="bg-aubergine p-6 sm:p-8">
            <h2 className="font-display text-3xl font-light text-zari">Get your invite link</h2>
            <p className="mb-6 mt-2 text-sm text-mute">It only takes a moment, and your link never changes.</p>
            <ReferForm welcomeOffer={rewards.welcomeOffer} />
          </div>
        </section>

        <div className="mx-auto max-w-7xl px-5 sm:px-8">
          <div className="grid gap-px border border-line bg-line sm:grid-cols-3">
            {steps.map((s) => (
              <div key={s.n} className="bg-night p-8">
                <span className="font-display text-4xl font-light italic text-brass">{s.n}</span>
                <h2 className="mt-4 font-display text-2xl text-zari">{s.title}</h2>
                <p className="mt-3 text-[15px] leading-relaxed text-mute">{s.body}</p>
              </div>
            ))}
          </div>
        </div>

        <section className="mt-24 bg-aubergine">
          <div className="mx-auto max-w-7xl px-5 py-20 sm:px-8">
            <p className="kicker">Loyalty</p>
            <h2 className="headline mt-4 max-w-3xl text-[clamp(2.25rem,5vw,4rem)] leading-none">
              The more you rent, the more you save
            </h2>
            <div className="mt-10 grid gap-8 sm:grid-cols-3">
              {tiers.map((t, i) => {
                const top = i === tiers.length - 1 && t.discountPct > 0;
                return (
                  <div key={t.name} className={`border-t pt-5 ${top ? "border-brass" : "border-mute"}`}>
                    <p className={`font-display text-[2.75rem] font-light leading-tight ${top ? "text-brass" : "text-zari"}`}>
                      {t.discountPct ? `${t.discountPct}% off` : "Invites & credit"}
                    </p>
                    <h3 className="mt-2 text-[17px] font-medium text-cream">{t.name}</h3>
                    <p className="mt-1 text-sm text-mute">
                      {t.minRentals === 0 ? "From your first rental" : `After ${t.minRentals} rentals`} ·{" "}
                      {t.discountPct ? "every rental, automatically" : `${welcome} for friends, ${reward} for you`}
                    </p>
                  </div>
                );
              })}
            </div>
            <p className="mt-10 max-w-xl text-[13px] leading-relaxed text-mute">
              Rewards are matched to the email or phone you rent with and applied automatically when{" "}
              {siteConfig.ownerName} confirms a rental.
              {rewards.scope === "maria" ? ` They apply to pieces from ${siteConfig.ownerName}'s closet.` : ""}
            </p>
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
