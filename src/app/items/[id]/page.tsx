import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import Petals from "@/components/Petals";
import SpinViewerClient from "@/components/SpinViewerClient";
import RentRequestForm from "@/components/RentRequestForm";
import RecordView from "@/components/RecordView";
import WaitlistButton from "@/components/WaitlistButton";
import ShareButton from "@/components/ShareButton";
import SizeFit from "@/components/SizeFit";
import CompleteTheLook from "@/components/CompleteTheLook";
import ReviewsSection from "@/components/ReviewsSection";
import { AlpanaCorner, ScallopValance } from "@/components/Ornament";
import { getItemById, getItems } from "@/lib/store";
import { approvedForItem } from "@/lib/reviews";
import { money } from "@/data/config";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: { id: string };
}): Promise<Metadata> {
  const item = await getItemById(params.id);
  if (!item) return {};
  return { title: `${item.name} — Maria's Closet`, description: item.description };
}

export default async function ItemPage({ params }: { params: { id: string } }) {
  const item = await getItemById(params.id);
  if (!item) notFound();

  const images = item.frames?.length ? item.frames : [item.image];
  const [allItems, reviews] = await Promise.all([getItems(), approvedForItem(item.id)]);

  return (
    <>
      <RecordView itemId={item.id} />
      <Petals />
      <div className="relative z-10">
        <Navbar />
        <main className="mx-auto max-w-6xl px-5 py-8">
          <div className="flex items-center justify-between gap-3">
            <Link
              href="/"
              className="text-sm font-medium text-gold/80 transition hover:text-marigold"
            >
              ‹ Back to the closet
            </Link>
            <ShareButton title={item.name} />
          </div>

          <div className="mt-6 grid gap-10 lg:grid-cols-2">
            {/* 3D inspect viewer */}
            <div>
              <div className="panel relative overflow-hidden">
                <ScallopValance className="h-5 w-full text-gold/70" />
                <AlpanaCorner className="absolute left-3 top-8 h-12 w-12 text-gold/30" />
                <AlpanaCorner className="absolute right-3 top-8 h-12 w-12 -scale-x-100 text-gold/30" />
                <div
                  className="relative aspect-[4/5] w-full"
                  style={{
                    background: `radial-gradient(70% 60% at 50% 38%, ${item.accent}33, transparent 70%)`,
                  }}
                >
                  <SpinViewerClient images={images} accent={item.accent} />
                  <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 text-xs uppercase tracking-[0.2em] text-gold/70">
                    {images.length > 1 ? "drag to spin 360°" : "drag to take a closer look"}
                  </p>
                </div>
              </div>
            </div>

            {/* details + request */}
            <div>
              <p className="eyebrow">
                {item.category}
                {item.brand ? ` · ${item.brand}` : ""}
              </p>
              <h1 className="mt-2 font-display text-5xl leading-tight text-gold-shimmer">
                {item.name}
              </h1>
              <p className="mt-3 text-3xl font-semibold text-gold">
                {money(item.pricePerDay)}{" "}
                <span className="text-base font-normal text-cream/60">/ day</span>
              </p>

              <div className="mt-4 flex flex-wrap gap-2 text-sm">
                <span className="chip">Size {item.size}</span>
                <span className="chip">{item.color}</span>
                {item.retailValue && <span className="chip">Retail {money(item.retailValue)}</span>}
              </div>

              <p className="mt-5 text-cream/80">{item.description}</p>

              {item.details && (
                <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-cream/75">
                  {item.details.map((d) => (
                    <li key={d} className="flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-marigold" />
                      {d}
                    </li>
                  ))}
                </ul>
              )}

              <SizeFit item={item} />

              <div className="mt-4">
                <WaitlistButton itemId={item.id} />
              </div>

              <div className="my-7 h-px bg-gradient-to-r from-transparent via-gold/40 to-transparent" />

              <RentRequestForm item={item} />
            </div>
          </div>

          <CompleteTheLook item={item} all={allItems} />
          <ReviewsSection itemId={item.id} reviews={reviews} />
        </main>
        <Footer />
      </div>
    </>
  );
}
