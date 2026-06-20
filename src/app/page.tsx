import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Showcase from "@/components/Showcase";
import { siteConfig } from "@/data/config";

const steps = [
  {
    n: "01",
    title: "Spin the rail",
    body: "Drag through the closet in 3D and find a piece you love.",
  },
  {
    n: "02",
    title: "Pick your dates",
    body: "Check the availability calendar and choose your rental window.",
  },
  {
    n: "03",
    title: "Request to rent",
    body: `Send a request — ${siteConfig.ownerName} confirms, you wear it beautifully.`,
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main>
        <section className="mx-auto max-w-6xl px-5 pb-2 pt-12 text-center sm:pt-16">
          <p className="eyebrow animate-fade-up">A rentable closet</p>
          <h1 className="mx-auto mt-3 max-w-3xl font-serif text-4xl leading-tight text-ink animate-fade-up sm:text-6xl">
            {siteConfig.tagline}
          </h1>
          <p className="mx-auto mt-4 max-w-xl text-cocoa animate-fade-up">
            {siteConfig.description}
          </p>
        </section>

        <Showcase />

        <section id="how" className="mx-auto max-w-6xl px-5 pt-20">
          <p className="eyebrow text-center">How it works</p>
          <h2 className="mt-2 text-center font-serif text-3xl text-ink sm:text-4xl">
            Three easy steps
          </h2>
          <div className="mt-10 grid gap-5 sm:grid-cols-3">
            {steps.map((s) => (
              <div
                key={s.n}
                className="rounded-2xl border border-cocoa/12 bg-white/50 p-6 shadow-card"
              >
                <span className="font-serif text-3xl text-gold">{s.n}</span>
                <h3 className="mt-3 font-serif text-xl text-ink">{s.title}</h3>
                <p className="mt-2 text-sm text-cocoa">{s.body}</p>
              </div>
            ))}
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
