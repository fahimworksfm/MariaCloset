import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Rail from "@/components/Rail";
import Lookbook from "@/components/Lookbook";
import HeroVideo from "@/components/HeroVideo";
import Reveal from "@/components/Reveal";
import { siteConfig, money } from "@/data/config";
import { getItems } from "@/lib/store";
import { getLookbookFor } from "@/lib/lookbookStore";
import { getSettings } from "@/lib/settings";

export const dynamic = "force-dynamic";

const steps = [
  { n: "01", title: "Find your piece", body: "Scroll the rail or browse the closet and find a piece you love." },
  { n: "02", title: "Pick your dates", body: "Check the availability calendar and choose your rental window." },
  {
    n: "03",
    title: "Request to rent",
    body: `Send a request. ${siteConfig.ownerName} confirms, you wear it beautifully.`,
  },
];

/** "Borrow something beautiful." → the last word set in italics. */
function Tagline({ text }: { text: string }) {
  const i = text.trimEnd().lastIndexOf(" ");
  if (i < 0) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)} <em className="italic">{text.slice(i + 1)}</em>
    </>
  );
}

export default async function Home() {
  const [items, looks, { site, rewards }] = await Promise.all([
    getItems(),
    getLookbookFor(siteConfig.ownerName),
    getSettings(),
  ]);
  return (
    <div className="relative z-10">
      <Navbar overlay />
      <main>
        {/* Hero */}
        <section className="relative flex min-h-[88vh] flex-col justify-end overflow-hidden">
          {site.heroVideo ? (
            <HeroVideo src={site.heroVideo} />
          ) : (
            // eslint-disable-next-line @next/next/no-img-element
            <img src="/brand/silk-light.jpg" alt="" className="absolute inset-0 h-full w-full object-cover" />
          )}
          <div className="relative mx-auto w-full max-w-7xl px-5 pb-14 pt-32 sm:px-8">
            <p className="kicker animate-fade-up">A rentable closet</p>
            <h1 className="headline mt-6 max-w-5xl text-[clamp(3.5rem,10vw,9.25rem)] animate-fade-up">
              <Tagline text={site.tagline} />
            </h1>
            <div className="mt-8 flex flex-wrap items-end justify-between gap-6 animate-fade-up">
              <p className="max-w-md leading-relaxed text-cream/85">{site.description}</p>
              <div className="flex flex-wrap gap-3">
                <Link href="/browse" className="btn-primary">
                  Browse the closet
                </Link>
                <Link href="/#rail" className="btn-ghost">
                  The rail
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* The rail */}
        <section id="rail" className="scroll-mt-20 pt-24">
          <div className="mx-auto flex max-w-7xl flex-wrap items-baseline justify-between gap-3 px-5 pb-8 sm:px-8">
            <h2 className="headline text-[clamp(2.25rem,5vw,3.75rem)]">The rail</h2>
            <Link href="/browse" className="py-3 text-sm text-brass transition hover:text-zari">
              Browse all pieces →
            </Link>
          </div>
          <div className="mx-auto max-w-7xl">
            <Rail items={items} />
          </div>
        </section>

        <Lookbook entries={looks} />

        {/* How it works */}
        <section id="how" className="mx-auto max-w-7xl scroll-mt-20 px-5 pt-28 sm:px-8">
          <h2 className="headline text-[clamp(2.25rem,5vw,3.75rem)]">Three easy steps</h2>
          <div className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1} className="bg-night p-8">
                <span className="font-display text-4xl font-light italic text-brass">{s.n}</span>
                <h3 className="mt-4 font-display text-2xl text-zari">{s.title}</h3>
                <p className="mt-3 text-[15px] leading-relaxed text-mute">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </section>

        {/* Rewards */}
        {rewards.enabled && (
          <section className="mt-28 bg-aubergine">
            <div className="mx-auto flex max-w-7xl flex-wrap items-end justify-between gap-12 px-5 py-20 sm:px-8">
              <div className="min-w-0 flex-1 basis-80">
                <p className="kicker">Rewards</p>
                <h2 className="headline mt-4 text-[clamp(2.25rem,5vw,3.75rem)] leading-none">
                  The more you borrow, the less you pay.
                </h2>
                <p className="mt-5 max-w-md text-mute">
                  Invite a friend: they get {money(rewards.welcomeOffer)} off their first rental, and you get{" "}
                  {money(rewards.referralReward)} credit once it is confirmed.
                </p>
                <Link href="/refer" className="btn-ghost mt-7">
                  Get your invite link
                </Link>
              </div>
              <div className="grid flex-1 basis-80 grid-cols-3 gap-4">
                {rewards.tiers.map((t, i) => {
                  const top = i === rewards.tiers.length - 1 && t.discountPct > 0;
                  return (
                    <div key={t.name} className={`border-t pt-4 ${top ? "border-brass" : "border-mute"}`}>
                      <p className={`font-display text-4xl font-light ${top ? "text-brass" : "text-zari"}`}>
                        {t.discountPct ? `${t.discountPct}%` : "—"}
                      </p>
                      <p className="mt-2 text-[15px] text-cream">{t.name}</p>
                      <p className="mt-1 text-[13px] text-mute">
                        {t.minRentals === 0 ? "First rental" : `After ${t.minRentals} rentals`}
                      </p>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        )}
      </main>
      <Footer />
    </div>
  );
}
