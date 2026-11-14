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
import { getItemById, getItems } from "@/lib/store";
import { getSettings } from "@/lib/settings";
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
  const [allItems, reviews, settings] = await Promise.all([getItems(), approvedForItem(item.id), getSettings()]);

  const facts: [string, string][] = [
    ["Size", item.size],
    ["Colour", item.color],
  ];
  if (item.occasions?.length) facts.push(["Occasions", item.occasions.join(", ")]);
  if (item.details?.length) facts.push(["Details", item.details.join(" · ")]);

  return (
    <>
      <RecordView itemId={item.id} />
      <Petals />
      <div className="relative z-10">
        <Navbar />
        <main>
          <div className="grid lg:grid-cols-2">
            {/* 3D inspect viewer — full-bleed on the left, pinned while the details scroll */}
            <div className="relative bg-aubergine lg:sticky lg:top-[61px] lg:h-[calc(100vh-61px)]">
              <div className="relative aspect-[4/5] w-full lg:aspect-auto lg:h-full">
                <SpinViewerClient images={images} accent={item.accent} />
                <p className="pointer-events-none absolute bottom-4 left-1/2 -translate-x-1/2 whitespace-nowrap bg-night/60 px-3 py-1.5 text-xs text-cream backdrop-blur">
                  {images.length > 1 ? "Drag to spin 360°" : "Drag to take a closer look"}
                </p>
              </div>
            </div>

            {/* details + request */}
            <div className="px-5 pb-16 pt-6 sm:px-10 lg:px-14 lg:pt-10">
              <div className="flex items-center justify-between gap-3">
                <Link href="/browse" className="py-3 text-sm text-mute transition hover:text-cream">
                  ← The closet
                </Link>
                <ShareButton title={item.name} />
              </div>

              <p className="kicker mt-8">
                {item.category}
                {item.brand ? ` · ${item.brand}` : ""}
              </p>
              <h1 className="headline mt-4 text-[clamp(2.75rem,5.4vw,4.75rem)] leading-[0.95]">{item.name}</h1>
              <p className="mt-5 flex flex-wrap items-baseline gap-x-3 gap-y-1">
                <span className="font-display text-4xl font-light text-zari">{money(item.pricePerDay)}</span>
                <span className="text-sm text-mute">
                  per day{item.retailValue ? ` · retail value ${money(item.retailValue)}` : ""}
                </span>
              </p>

              <p className="mt-6 max-w-xl leading-relaxed text-cream/85">{item.description}</p>

              <dl className="mt-8 grid gap-px border border-line bg-line sm:grid-cols-2">
                {facts.map(([k, v]) => (
                  <div key={k} className="bg-night px-4 py-4">
                    <dt className="text-xs text-mute">{k}</dt>
                    <dd className="mt-1 text-[15px] text-cream">{v}</dd>
                  </div>
                ))}
              </dl>

              <SizeFit item={item} />

              <div className="mt-5">
                <WaitlistButton itemId={item.id} />
              </div>

              <div className="mt-10 bg-aubergine p-5 sm:p-7">
                <h2 className="mb-5 font-display text-3xl font-light text-zari">Request to rent</h2>
                <RentRequestForm item={item} rewards={settings.rewards} ownerEmail={settings.site.ownerEmail} />
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-5 sm:px-8">
            <CompleteTheLook item={item} all={allItems} />
            <ReviewsSection itemId={item.id} reviews={reviews} />
          </div>
        </main>
        <Footer />
      </div>
    </>
  );
}
