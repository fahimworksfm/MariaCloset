import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Petals from "@/components/Petals";
import ItemCard from "@/components/ItemCard";
import { PaisleyDivider } from "@/components/Ornament";
import { getItems } from "@/lib/store";
import { siteConfig } from "@/data/config";

export const dynamic = "force-dynamic";

export function generateMetadata({ params }: { params: { name: string } }): Metadata {
  return { title: `${decodeURIComponent(params.name)}'s closet — Maria's Closet` };
}

export default async function ClosetPage({ params }: { params: { name: string } }) {
  const name = decodeURIComponent(params.name);
  const items = (await getItems()).filter((i) => (i.closet || siteConfig.ownerName) === name);
  if (items.length === 0) notFound();

  return (
    <>
      <Petals />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 py-10">
          <Link href="/closets" className="text-sm font-medium text-gold/80 transition hover:text-marigold">
            ‹ All closets
          </Link>
          <h1 className="mt-4 text-center font-display text-5xl text-gold-shimmer">
            {name}&apos;s closet
          </h1>
          <PaisleyDivider className="mx-auto my-6 h-7 w-40 text-gold/70" />
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} />
            ))}
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
