"use client";

import Link from "next/link";
import { useRef } from "react";
import type { Item } from "@/lib/types";
import { money } from "@/data/config";
import { wishlist, useStoreList } from "@/lib/clientStore";

const isRaster = (url: string) => !/\.svg(\?|#|$)/i.test(url);
const prefersReducedMotion = () =>
  typeof window !== "undefined" &&
  window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

export default function ItemCard({ item, compact = false }: { item: Item; compact?: boolean }) {
  const saved = useStoreList(wishlist);
  const isSaved = saved.includes(item.id);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Play the short clip only while hovering (desktop); never on reduced motion.
  function playHover() {
    const v = videoRef.current;
    if (!v || prefersReducedMotion()) return;
    v.play().catch(() => {});
  }
  function stopHover() {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    try {
      v.currentTime = 0; // reset to first frame for the next hover
    } catch {
      /* ignore */
    }
  }

  return (
    <Link
      href={`/items/${item.id}`}
      onMouseEnter={playHover}
      onMouseLeave={stopHover}
      className="group panel relative block overflow-hidden p-3 transition duration-300 hover:-translate-y-1.5 hover:border-gold/50 hover:shadow-glow"
    >
      <button
        aria-label={isSaved ? "Remove from saved" : "Save"}
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          wishlist.toggle(item.id);
        }}
        className="absolute right-4 top-4 z-10 grid h-9 w-9 place-items-center rounded-full border border-gold/30 bg-night/60 text-lg backdrop-blur transition hover:scale-110"
      >
        <span className={isSaved ? "text-rani" : "text-gold/70"}>{isSaved ? "♥" : "♡"}</span>
      </button>

      <div
        className="relative grid w-full place-items-center overflow-hidden rounded-xl"
        style={{
          aspectRatio: compact ? "1 / 1" : "4 / 5",
          background: `radial-gradient(70% 60% at 50% 40%, ${item.accent}33, #1a0826 75%)`,
        }}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={item.image}
          alt={item.name}
          loading="lazy"
          className={`h-full w-full ${
            isRaster(item.image) ? "object-cover" : "object-contain"
          } transition duration-500 group-hover:scale-105`}
        />

        {item.video && (
          <>
            <video
              ref={videoRef}
              src={item.video}
              muted
              loop
              playsInline
              preload="none"
              aria-hidden
              className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
            />
            {/* subtle "has motion" cue, fades out once the clip plays */}
            <span className="pointer-events-none absolute bottom-3 left-3 z-10 flex items-center gap-1 rounded-full border border-gold/30 bg-night/60 px-2.5 py-1 text-[10px] font-medium uppercase tracking-wider text-gold/90 backdrop-blur transition-opacity duration-300 group-hover:opacity-0">
              <span className="text-[8px]">▶</span> Motion
            </span>
          </>
        )}
      </div>

      <div className="px-1 pb-1 pt-3">
        <p className="eyebrow truncate">
          {item.category}
          {item.brand ? ` · ${item.brand}` : ""}
        </p>
        <h3 className="mt-1 truncate font-display text-xl text-cream">{item.name}</h3>
        <p className="mt-1 text-sm text-cream/70">
          <span className="font-semibold text-gold">{money(item.pricePerDay)}</span> / day
        </p>
        {!compact && item.occasions && item.occasions.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {item.occasions.slice(0, 3).map((o) => (
              <span key={o} className="rounded-full bg-gold/10 px-2 py-0.5 text-[11px] text-gold/80">
                {o}
              </span>
            ))}
          </div>
        )}
      </div>
    </Link>
  );
}
