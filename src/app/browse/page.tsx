import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Petals from "@/components/Petals";
import BrowseGrid from "@/components/BrowseGrid";
import RecentlyViewed from "@/components/RecentlyViewed";
import FestivalCountdown from "@/components/FestivalCountdown";
import { PaisleyDivider } from "@/components/Ornament";
import { getItems } from "@/lib/store";

export const dynamic = "force-dynamic";
export const metadata: Metadata = { title: "Browse — Maria's Closet" };

export default async function BrowsePage({
  searchParams,
}: {
  searchParams: { category?: string };
}) {
  const items = await getItems();
  return (
    <>
      <Petals />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 py-10">
          <FestivalCountdown className="mx-auto mb-6 block w-fit rounded-full border border-gold/30 bg-gold/10 px-5 py-2 text-center text-sm text-gold" />
          <p className="eyebrow text-center">The collection</p>
          <h1 className="mt-2 text-center font-display text-5xl text-gold-shimmer">
            Browse the closet
          </h1>
          <PaisleyDivider className="mx-auto my-6 h-7 w-40 text-gold" />
          <BrowseGrid items={items} initialCategory={searchParams.category} />
          <RecentlyViewed items={items} />
        </main>
        <Footer />
      </div>
    </>
  );
}
