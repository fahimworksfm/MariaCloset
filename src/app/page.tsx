import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Showcase from "@/components/Showcase";
import Petals from "@/components/Petals";
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
    n: "০১",
    title: "Spin the almari",
    bn: "ঘোরাও",
    body: "Drag through the rail in 3D and find a piece you love.",
    grad: "from-rani to-royal",
  },
  {
    n: "০২",
    title: "Pick your dates",
    bn: "তারিখ বাছো",
    body: "Check the availability calendar and choose your rental window.",
    grad: "from-peacock to-emerald",
  },
  {
    n: "০৩",
    title: "Request to rent",
    bn: "অনুরোধ পাঠাও",
    body: `Send a request — ${siteConfig.ownerName} confirms, you wear it beautifully.`,
    grad: "from-marigold to-saffron",
  },
];

const occasions = ["পুজো", "বিয়ে", "আদ্দা", "ঈদ", "সঙ্গীত", "জন্মদিন", "অনুষ্ঠান", "মেহেন্দি"];

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
            <p className="eyebrow animate-fade-up">✦ A rentable almari ✦</p>
            <h1 className="mx-auto mt-4 max-w-3xl font-display text-5xl leading-[1.05] text-gold-shimmer animate-fade-up sm:text-7xl">
              {siteConfig.tagline}
            </h1>
            <p className="mt-4 font-bengali text-3xl text-rani animate-fade-up sm:text-4xl">
              {siteConfig.taglineBn}
            </p>
            <p className="mx-auto mt-5 max-w-xl text-cream/75 animate-fade-up">
              {siteConfig.description}
            </p>
            <PaisleyDivider className="mx-auto mt-8 h-7 w-44 text-gold animate-fade-up" />
          </section>

          {/* occasion ribbon */}
          <div className="relative my-6 overflow-hidden border-y border-gold/25 bg-gradient-to-r from-rani/30 via-marigold/25 to-peacock/30 py-3">
            <div className="flex w-max animate-marquee gap-0 whitespace-nowrap">
              {[0, 1].map((dup) => (
                <div key={dup} className="flex items-center" aria-hidden={dup === 1}>
                  {occasions.map((w) => (
                    <span key={w} className="flex items-center">
                      <span className="font-bengali text-xl text-cream/90">{w}</span>
                      <span className="mx-5 text-gold">✦</span>
                    </span>
                  ))}
                </div>
              ))}
            </div>
          </div>

          <ScallopValance className="h-7 w-full text-gold/80" />
          <Showcase items={items} />

          <section id="how" className="mx-auto max-w-6xl px-5 pt-20">
            <p className="eyebrow text-center">How it works</p>
            <h2 className="mt-2 text-center font-display text-4xl text-cream sm:text-5xl">
              Three easy steps
            </h2>
            <PaisleyDivider className="mx-auto mt-4 h-7 w-40 text-gold" />
            <div className="mt-12 grid gap-6 sm:grid-cols-3">
              {steps.map((s) => (
                <div key={s.n} className="panel relative overflow-hidden p-7">
                  <AlpanaCorner className="absolute right-2 top-2 h-10 w-10 text-gold/30" />
                  <div className="flex items-center justify-between">
                    <span
                      className={`grid h-14 w-14 place-items-center rounded-full bg-gradient-to-br ${s.grad} font-bengali text-2xl font-bold text-white shadow-glow`}
                    >
                      {s.n}
                    </span>
                    <span className="font-bengali text-lg text-marigold">{s.bn}</span>
                  </div>
                  <h3 className="mt-5 font-display text-2xl text-gold">{s.title}</h3>
                  <p className="mt-2 text-sm text-cream/70">{s.body}</p>
                </div>
              ))}
            </div>
          </section>
        </main>
        <Footer />
      </div>
    </>
  );
}
