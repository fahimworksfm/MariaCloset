import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SpinViewerClient from "@/components/SpinViewerClient";
import RentRequestForm from "@/components/RentRequestForm";
import { getItem, items } from "@/data/items";
import { money, siteConfig } from "@/data/config";

export function generateStaticParams() {
  return items.map((i) => ({ id: i.id }));
}

export function generateMetadata({ params }: { params: { id: string } }): Metadata {
  const item = getItem(params.id);
  if (!item) return { title: siteConfig.name };
  return {
    title: `${item.name} — ${siteConfig.name}`,
    description: item.description,
  };
}

export default function ItemPage({ params }: { params: { id: string } }) {
  const item = getItem(params.id);
  if (!item) notFound();

  const images = item.frames?.length ? item.frames : [item.image];

  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-5 py-8">
        <Link href="/" className="text-sm text-cocoa transition hover:text-ink">
          ‹ Back to the rail
        </Link>

        <div className="mt-6 grid gap-10 lg:grid-cols-2">
          {/* 3D inspect viewer */}
          <div>
            <div
              className="relative aspect-[4/5] w-full overflow-hidden rounded-3xl border border-cocoa/12 shadow-soft"
              style={{
                background: `radial-gradient(80% 70% at 50% 30%, ${item.accent}22, #FBF6EE 70%)`,
              }}
            >
              <SpinViewerClient images={images} accent={item.accent} />
              <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-xs text-cocoa/70">
                {images.length > 1 ? "drag to spin 360°" : "drag to take a closer look"}
              </p>
            </div>
          </div>

          {/* Details + request */}
          <div>
            <p className="eyebrow">
              {item.category}
              {item.brand ? ` · ${item.brand}` : ""}
            </p>
            <h1 className="mt-2 font-serif text-4xl text-ink">{item.name}</h1>
            <p className="mt-3 text-2xl text-ink">
              {money(item.pricePerDay)}{" "}
              <span className="text-base text-cocoa">/ day</span>
            </p>

            <div className="mt-4 flex flex-wrap gap-2 text-sm">
              <span className="rounded-full bg-sand px-3 py-1 text-cocoa">Size {item.size}</span>
              <span className="rounded-full bg-sand px-3 py-1 text-cocoa">{item.color}</span>
              {item.retailValue && (
                <span className="rounded-full bg-sand px-3 py-1 text-cocoa">
                  Retail {money(item.retailValue)}
                </span>
              )}
            </div>

            <p className="mt-5 text-cocoa">{item.description}</p>

            {item.details && (
              <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-cocoa">
                {item.details.map((d) => (
                  <li key={d} className="flex items-center gap-2">
                    <span className="h-1.5 w-1.5 rounded-full bg-gold" />
                    {d}
                  </li>
                ))}
              </ul>
            )}

            <hr className="my-7 border-cocoa/10" />

            <RentRequestForm item={item} />
          </div>
        </div>
      </main>
      <Footer />
    </>
  );
}
