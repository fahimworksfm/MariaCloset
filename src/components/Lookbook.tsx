"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { type LookEntry } from "@/data/lookbook";

/** Elegant fallback shown until a real photo exists for this entry. */
function Plate({ entry }: { entry: LookEntry }) {
  return (
    <div className="absolute inset-0 grid place-items-center bg-white/[0.03]">
      <span className="px-6 text-center font-display text-3xl tracking-wide text-cream/25 sm:text-4xl">
        {entry.title}
      </span>
    </div>
  );
}

function Tile({
  entry,
  aspect,
  className = "",
  priority = false,
}: {
  entry: LookEntry;
  /** Mobile aspect ratio (desktop fills its row via md:h-full). */
  aspect: string;
  className?: string;
  priority?: boolean;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const reduce = useReducedMotion();
  const [broken, setBroken] = useState(false);

  // Subtle parallax: the image drifts within its overflow-hidden frame.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  const showImg = Boolean(entry.image) && !broken;

  function playHover() {
    const v = videoRef.current;
    if (!v || reduce) return;
    v.play().catch(() => {});
  }
  function stopHover() {
    const v = videoRef.current;
    if (!v) return;
    v.pause();
    try {
      v.currentTime = 0;
    } catch {
      /* ignore */
    }
  }

  return (
    <motion.div
      ref={ref}
      onMouseEnter={playHover}
      onMouseLeave={stopHover}
      initial={{ opacity: 0, y: 26 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-70px" }}
      transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      className={`group relative overflow-hidden rounded-2xl border border-gold/20 ${aspect} md:aspect-auto md:h-full ${className}`}
    >
      {showImg ? (
        <motion.div style={{ y }} className="absolute inset-x-0 -top-[10%] h-[120%]">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={entry.image}
            alt={entry.title}
            loading={priority ? "eager" : "lazy"}
            onError={() => setBroken(true)}
            className="h-full w-full object-cover transition duration-700 group-hover:scale-[1.04]"
          />
        </motion.div>
      ) : (
        <Plate entry={entry} />
      )}

      {entry.video && (
        <>
          <video
            ref={videoRef}
            src={entry.video}
            muted
            loop
            playsInline
            preload="none"
            aria-hidden
            className="pointer-events-none absolute inset-0 h-full w-full object-cover opacity-0 transition-opacity duration-500 group-hover:opacity-100"
          />
          {/* subtle "has motion" cue, fades once the clip plays */}
          <span className="pointer-events-none absolute right-3 top-3 z-10 grid h-7 w-7 place-items-center rounded-full border border-gold/30 bg-night/50 text-[9px] text-gold/90 backdrop-blur transition-opacity duration-300 group-hover:opacity-0">
            ▶
          </span>
        </>
      )}

      {/* scrim for caption legibility */}
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-night/85 via-night/15 to-transparent" />

      <div className="absolute inset-x-0 bottom-0 p-5 sm:p-6">
        <p className="eyebrow">{entry.kicker}</p>
        <h3 className="mt-1 font-display text-2xl text-cream sm:text-3xl">{entry.title}</h3>
        <p className="mt-1 max-w-sm text-sm text-cream/70">{entry.caption}</p>
        {entry.itemId && (
          <Link
            href={`/items/${entry.itemId}`}
            className="mt-3 inline-block text-sm font-medium text-gold transition hover:text-zari"
          >
            View the piece →
          </Link>
        )}
      </div>
    </motion.div>
  );
}

/** Editorial "The Edit" lookbook — magazine-spread layout with scroll reveals.
 *  The first tile is the large feature; the rest flow beside and below it, so
 *  any number of tiles (managed in the admin Lookbook editor) composes cleanly. */
export default function Lookbook({
  entries,
  eyebrow = "The Edit",
  title = "Styled for the season",
  subtitle = "A closer look at how each piece wears — from grand entrances to quiet evenings.",
}: {
  entries: LookEntry[];
  eyebrow?: string;
  title?: string;
  subtitle?: string;
}) {
  if (!entries || entries.length === 0) return null;

  return (
    <section id="lookbook" className="mx-auto max-w-6xl px-5 pt-24">
      <div className="text-center">
        <p className="eyebrow">{eyebrow}</p>
        <h2 className="mt-2 font-display text-4xl text-gold-shimmer sm:text-5xl">{title}</h2>
        <p className="mx-auto mt-3 max-w-xl text-cream/70">{subtitle}</p>
        <div className="mx-auto mt-6 h-px w-24 bg-cream/20" />
      </div>

      <div className="mt-10 grid gap-4 md:auto-rows-[15rem] md:grid-cols-4">
        {entries.map((entry, i) => (
          <Tile
            key={entry.id}
            entry={entry}
            priority={i === 0}
            aspect={i === 0 ? "aspect-[4/5]" : "aspect-[16/10]"}
            className={i === 0 ? "md:col-span-2 md:row-span-2" : "md:col-span-2"}
          />
        ))}
      </div>
    </section>
  );
}
