import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Showcase from "@/components/Showcase";
import Petals from "@/components/Petals";
import Reveal from "@/components/Reveal";
import FestivalCountdown from "@/components/FestivalCountdown";
import {
  MarigoldToran,
  Mandala,
  ScallopValance,
  PaisleyDivider,
  AlpanaCorner,
} from "@/components/Ornament";
import { siteConfig } from "@/data/config";
import { getItems } from "@/lib/store";

export const dynamic = "force-dynamic";

const steps = [
  {
    n: "01",
    title: "Spin the rail",
    body: "Drag through the rail in 3D and find a piece you love.",
    grad: "from-rani to-royal",
  },
  {
    n: "02",
    title: "Pick your dates",
    body: "Check the availability calendar and choose your rental window.",
    grad: "from-peacock to-emerald",
  },
  {
    n: "03",
    title: "Request to rent",
    body: `Send a request — ${siteConfig.ownerName} confirms, you wear it beautifully.`,
    grad: "from-marigold to-saffron",
  },
];

const occasions = [
  "Weddings",
  "Receptions",
  "Parties",
  "Festivals",
  "Galas",
  "Date Nights",
  "Brunches",
  "Celebrations",
];

export default async function Home() {
  const items = await getItems();
  return (
    <>
      <Petals />
      <MarigoldToran className="relative z-20 h-16 w-full" />
      <div className="relative z-10">
        <Navbar />
        <main>
          <section className="relative mx-auto max-w-6xl overflow-hidden px-5 pb-4 pt-12 text-center sm:pt-16">
            <Mandala className="pointer-events-none absolute left-1/2 top-[-120px] -z-10 h-[560px] w-[560px] -translate-x-1/2 animate-spin-slow text-gold/[0.08]" />
            <p className="eyebrow animate-fade-up">✦ A rentable closet ✦</p>
            <h1 className="mx-auto mt-4 max-w-3xl font-display text-5xl leading-[1.05] text-gold-shimmer animate-fade-up sm:text-7xl">
              {siteConfig.tagline}
            </h1>
            <p className="mx-auto mt-5 max-w-xl text-cream/75 animate-fade-up">
              {siteConfig.description}
            </p>
            <PaisleyDivider className="mx-auto mt-8 h-7 w-44 text-gold animate-fade-up" />
            <FestivalCountdown className="mx-auto mt-5 block w-fit rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-sm text-gold animate-fade-up" />
          </section>

          {/* occasion ribbon */}
          <div className="relative my-6 overflow-hidden border-y border-gold/25 bg-gradient-to-r from-rani/30 via-marigold/25 to-peacock/30 py-3">
            <div className="flex w-max animate-marquee gap-0 whitespace-nowrap">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
                  {occasions.map((w) => (
                    <span key={w} className="flex items-center">
                      <span className="text-sm font-semibold uppercase tracking-[0.2em] text-cream/90">
                        {w}
                      </span>
                      <span className="mx-5 text-gold">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <ScallopValance className="h-7 w-full text-gold/80" />
          <Showcase items={items} />

          <div className="mt-10 text-center">
            <Link href="/browse" className="btn-ghost">
              Browse all pieces →
            </Link>
          </div>

          <section id="how" className="mx-auto max-w-6xl px-5 pt-20">
            <p className="eyebrow text-center">How it works</p>
            <h2 className="mt-2 text-center font-display text-4xl text-cream sm:text-5xl">
              Three easy steps
            </h2>
            <PaisleyDivider className="mx-auto mt-4 h-7 w-40 text-gold" />
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {steps.map((s, i) => (
                <Reveal
                  key={s.n}
                  delay={i * 0.12}
                  className="panel relative overflow-hidden p-7 transition duration-300 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-glow"
                >
                  <AlpanaCorner className="absolute right-2 top-2 h-10 w-10 text-gold/30" />
                  <span
                    className={`grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br ${s.grad} font-display text-2xl font-bold text-white shadow-glow`}
                  >
                    {s.n}
                  </span>
                  <h3 className="mt-5 font-display text-2xl text-gold">{s.title}</h3>
                  <p className="mt-2 text-sm text-cream/70">{s.body}</p>
                </Reveal>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
