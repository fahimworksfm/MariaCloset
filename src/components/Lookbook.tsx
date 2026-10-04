"use client";

import Link from "next/link";
import { useRef, useState } from "react";
import { motion, useReducedMotion, useScroll, useTransform } from "framer-motion";
import { lookbook, type LookEntry } from "@/data/lookbook";

/** Elegant fallback shown until a real photo exists for this entry. */
function Plate({ entry }: { entry: LookEntry }) {
  return (
    <div
      className="absolute inset-0 grid place-items-center"
      style={{ background: `radial-gradient(90% 80% at 50% 30%, ${entry.accent}44, #160a12 78%)` }}
    >
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
  const reduce = useReducedMotion();
  const [broken, setBroken] = useState(false);

  // Subtle parallax: the image drifts within its overflow-hidden frame.
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start end", "end start"] });
  const y = useTransform(scrollYProgress, [0, 1], reduce ? ["0%", "0%"] : ["-6%", "6%"]);

  const showImg = Boolean(entry.image) && !broken;

  return (
    <motion.div
      ref={ref}
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

/** Editorial "The Edit" lookbook — magazine-spread layout with scroll reveals. */
export default function Lookbook() {
  const e = lookbook;
  if (e.length < 5) return null; // the composition below expects five entries

  return (
    <section id="lookbook" className="mx-auto max-w-6xl px-5 pt-24">
      <div className="text-center">
        <p className="eyebrow">The Edit</p>
        <h2 className="mt-2 font-display text-4xl text-gold-shimmer sm:text-5xl">
          Styled for the season
        </h2>
        <p className="mx-auto mt-3 max-w-xl text-cream/70">
          A closer look at how each piece wears — from grand entrances to quiet evenings.
        </p>
        <div className="mx-auto mt-6 h-px w-24 bg-gold/40" />
      </div>

      {/* Row 1 — tall feature beside two stacked looks */}
      <div className="mt-10 grid gap-4 md:h-[34rem] md:grid-cols-5">
        <Tile entry={e[0]} aspect="aspect-[4/5]" className="md:col-span-3" priority />
        <div className="grid gap-4 md:col-span-2 md:h-full md:grid-rows-2">
          <Tile entry={e[1]} aspect="aspect-[16/10]" />
          <Tile entry={e[2]} aspect="aspect-[16/10]" />
        </div>
      </div>

      {/* Row 2 — wide panorama beside a portrait */}
      <div className="mt-4 grid gap-4 md:h-[22rem] md:grid-cols-3">
        <Tile entry={e[3]} aspect="aspect-[16/10]" className="md:col-span-2" />
        <Tile entry={e[4]} aspect="aspect-[4/5]" className="md:col-span-1" />
      </div>
    </section>
  );
}
