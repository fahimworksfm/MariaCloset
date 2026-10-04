import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Showcase from "@/components/Showcase";
import Lookbook from "@/components/Lookbook";
import HeroVideo from "@/components/HeroVideo";
import Reveal from "@/components/Reveal";
import { siteConfig } from "@/data/config";
import { getItems } from "@/lib/store";
import { getLookbookFor } from "@/lib/lookbookStore";

export const dynamic = "force-dynamic";

const steps = [
  { n: "01", title: "Spin the rail", body: "Drag through the rail in 3D and find a piece you love." },
  { n: "02", title: "Pick your dates", body: "Check the availability calendar and choose your rental window." },
  {
    n: "03",
    title: "Request to rent",
    body: `Send a request — ${siteConfig.ownerName} confirms, you wear it beautifully.`,
  },
];

export default async function Home() {
  const [items, looks] = await Promise.all([
    getItems(),
    getLookbookFor(siteConfig.ownerName),
  ]);
  return (
    <div className="relative z-10">
      <Navbar />
      <main>
        {/* Hero */}
        <section className="relative mx-auto max-w-5xl overflow-hidden px-5 pb-16 pt-28 text-center sm:pt-40">
          {siteConfig.heroVideo && <HeroVideo src={siteConfig.heroVideo} />}
          <p className="eyebrow animate-fade-up">A rentable closet</p>
          <h1 className="mx-auto mt-7 max-w-3xl font-display text-6xl font-light leading-[1.02] tracking-tight text-zari animate-fade-up sm:text-7xl lg:text-[5.75rem]">
            {siteConfig.tagline}
          </h1>
          <p className="mx-auto mt-7 max-w-md text-[15px] leading-relaxed text-cream/55 animate-fade-up">
            {siteConfig.description}
          </p>
          <div className="mt-11 flex items-center justify-center gap-3 animate-fade-up">
            <Link href="/browse" className="btn-primary">
              Browse the closet
            </Link>
            <Link href="/#rail" className="btn-ghost">
              The rail
            </Link>
          </div>
        </section>

        {/* The rail */}
        <section className="pt-20">
          <p className="eyebrow text-center">Newest additions</p>
          <Showcase items={items} />
          <div className="mt-10 text-center">
            <Link href="/browse" className="btn-ghost">
              Browse all pieces →
            </Link>
          </div>
        </section>

        <Lookbook entries={looks} />

        {/* How it works */}
        <section id="how" className="mx-auto max-w-5xl px-5 pt-32">
          <p className="eyebrow text-center">How it works</p>
          <h2 className="mt-3 text-center font-display text-4xl font-light text-cream sm:text-5xl">
            Three easy steps
          </h2>
          <div className="mt-14 grid gap-px overflow-hidden rounded-xl border border-cream/10 bg-cream/10 sm:grid-cols-3">
            {steps.map((s, i) => (
              <Reveal key={s.n} delay={i * 0.1} className="bg-night p-8">
                <span className="font-display text-3xl font-light text-cream/40">{s.n}</span>
                <h3 className="mt-5 font-display text-xl text-cream">{s.title}</h3>
                <p className="mt-2 text-sm text-cream/55">{s.body}</p>
              </Reveal>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </div>
  );
}
