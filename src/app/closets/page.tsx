import type { Metadata } from "next";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { getItems } from "@/lib/store";
import { siteConfig, money } from "@/data/config";
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
    <div className="relative z-10">
      <Navbar />
      <main className="mx-auto max-w-7xl px-5 pt-14 sm:px-8">
        <div className="flex flex-wrap items-end justify-between gap-6">
          <div>
            <p className="kicker">Shared wardrobes</p>
            <h1 className="headline mt-5 text-[clamp(3.25rem,8vw,7rem)]">Closets</h1>
          </div>
          <p className="max-w-sm leading-relaxed text-mute">
            {siteConfig.ownerName}&apos;s pieces, and friends who&apos;ve opened their closets too.
          </p>
        </div>

        <div className="mt-12 grid gap-x-5 gap-y-12 md:grid-cols-2 lg:grid-cols-3">
          {closets.map(([name, list]) => {
            const from = Math.min(...list.map((i) => i.pricePerDay));
            return (
              <Link key={name} href={`/closet/${encodeURIComponent(name)}`} className="group block">
                <div className="grid grid-cols-3 gap-1">
                  {list.slice(0, 3).map((i) => (
                    <div key={i.id} className="aspect-[3/5] overflow-hidden bg-aubergine">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={i.image}
                        alt=""
                        loading="lazy"
                        className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.03]"
                      />
                    </div>
                  ))}
                </div>
                <div className="mt-4 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                  <h2 className="font-display text-3xl font-light text-zari transition group-hover:text-brass">
                    {name}&apos;s closet
                  </h2>
                  <span className="text-sm text-mute">
                    {list.length} piece{list.length > 1 ? "s" : ""} · from {money(from)} a day
                  </span>
                </div>
              </Link>
            );
          })}

          <div className="flex flex-col justify-end bg-aubergine p-8">
            <p className="kicker">Open it to friends</p>
            <h2 className="headline mt-4 text-[clamp(2.25rem,4vw,3rem)] leading-none">
              Open your <em className="italic">closet</em>
            </h2>
            <p className="mt-4 text-[15px] leading-relaxed text-mute">
              Apply to list your own pieces alongside {siteConfig.ownerName}&apos;s. Once approved, you&apos;ll
              manage your closet from your own dashboard.
            </p>
            <Link href="/join" className="btn-primary mt-6 self-start">
              Apply to join
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
