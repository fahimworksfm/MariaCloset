import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Petals from "@/components/Petals";
import { PaisleyDivider } from "@/components/Ornament";
import { getItems } from "@/lib/store";
import { siteConfig } from "@/data/config";
import type { Item } from "@/lib/types";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Closets — Maria's Closet" };

export default async function ClosetsPage() {
  const items = await getItems();
  const map = new Map<string, Item[]>();
  for (const i of items) {
    const c = i.closet || siteConfig.ownerName;
    if (!map.has(c)) map.set(c, []);
    map.get(c)!.push(i);
  }
  const closets = Array.from(map.entries());

  return (
    <>
      <Petals />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 py-10">
          <p className="eyebrow text-center">Shared wardrobes</p>
          <h1 className="mt-2 text-center font-display text-5xl text-gold-shimmer">Closets</h1>
          <PaisleyDivider className="mx-auto my-6 h-7 w-40 text-gold/70" />
          <p className="mx-auto max-w-xl text-center text-cream/65">
            Maria&apos;s pieces — and friends who&apos;ve opened their closets too.
          </p>

          <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {closets.map(([name, list]) => (
              <Link
                key={name}
                href={`/closet/${encodeURIComponent(name)}`}
                className="group panel overflow-hidden p-3 transition duration-300 hover:-translate-y-1.5 hover:border-gold/50"
              >
                <div
                  className="grid aspect-[16/10] place-items-center overflow-hidden rounded-xl"
                  style={{
                    background: `radial-gradient(70% 70% at 50% 40%, ${list[0]?.accent ?? "#A8536B"}33, #160a12 75%)`,
                  }}
                >
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={list[0]?.image}
                    alt=""
                    className="h-[85%] object-contain transition duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="flex items-baseline justify-between px-1 pt-3">
                  <h2 className="font-display text-2xl text-cream">{name}&apos;s closet</h2>
                  <span className="text-sm text-cream/60">
                    {list.length} piece{list.length > 1 ? "s" : ""}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
