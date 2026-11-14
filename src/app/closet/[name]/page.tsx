import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Petals from "@/components/Petals";
import ItemCard from "@/components/ItemCard";
import Lookbook from "@/components/Lookbook";
import { getItems } from "@/lib/store";
import { getLookbookFor } from "@/lib/lookbookStore";
import { siteConfig } from "@/data/config";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { name: string } }): Metadata {
  return { title: `${decodeURIComponent(params.name)}'s closet — Maria's Closet` };
}

export default async function ClosetPage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const [allItems, looks] = await Promise.all([getItems(), getLookbookFor(name)]);
  const items = allItems.filter((i) => (i.closet || siteConfig.ownerName) === name);
  if (items.length === 0) notFound();

  return (
    <>
      <Petals />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-7xl px-5 pt-6 sm:px-8">
          <Link href="/closets" className="inline-block py-3 text-sm text-mute transition hover:text-cream">
            ← All closets
          </Link>
          <div className="mb-12 mt-6 flex flex-wrap items-end justify-between gap-4">
            <h1 className="headline text-[clamp(3rem,8vw,7rem)]">
              {name}&apos;s <em className="italic">closet</em>
            </h1>
            <p className="text-sm text-mute">
              {items.length} piece{items.length > 1 ? "s" : ""}
            </p>
          </div>
          <div className="grid grid-cols-1 gap-x-5 gap-y-12 sm:grid-cols-2 lg:grid-cols-3">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>

          {looks.length > 0 && (
            <Lookbook
              entries={looks}
              title={`Styled by ${name}`}
              subtitle={`A closer look at how ${name}'s pieces wear.`}
            />
          )}
        </main>
        <Footer />
      </div>
    </>
  );
}
