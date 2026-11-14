import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Petals from "@/components/Petals";
import BrowseGrid from "@/components/BrowseGrid";
import RecentlyViewed from "@/components/RecentlyViewed";
import FestivalCountdown from "@/components/FestivalCountdown";
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
        <main className="mx-auto max-w-7xl px-5 pb-10 pt-14 sm:px-8">
          <FestivalCountdown className="mb-6 block w-fit border border-line px-5 py-2 text-sm text-cream" />
          <p className="kicker">The collection</p>
          <h1 className="headline mb-10 mt-5 text-[clamp(3.25rem,8vw,7rem)]">
            The <em className="italic">closet</em>
          </h1>
          <BrowseGrid items={items} initialCategory={searchParams.category} />
          <RecentlyViewed items={items} />
        </main>
        <Footer />
      </div>
    </>
  );
}
