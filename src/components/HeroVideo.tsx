"use client";

import { useEffect, useRef } from "react";

/**
 * Subtle looping cinemagraph behind the homepage headline. Muted autoplay,
 * scrimmed so the text stays readable and the clip feathers into the page.
 * Skipped under prefers-reduced-motion (the dark scrim remains).
 */
export default function HeroVideo({ src }: { src: string }) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const play = () => v.play().catch(() => {});
    play();
    // Some browsers ignore the autoplay attribute on hydration — nudge once ready.
    v.addEventListener("canplay", play, { once: true });
    return () => v.removeEventListener("canplay", play);
  }, []);

  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden" aria-hidden>
      {/* still shown instead of the clip under prefers-reduced-motion */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/brand/silk-light.jpg" alt="" className="hidden h-full w-full object-cover motion-reduce:block" />
      <video
        ref={ref}
        src={src}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
        className="h-full w-full object-cover opacity-75 motion-reduce:hidden"
      />
      {/* the headline sits bottom-left: darken the foot and feather into the canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-night/45 via-night/25 to-night" />
    </div>
  );
}
