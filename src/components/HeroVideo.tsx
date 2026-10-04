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
    <div className="pointer-events-none absolute inset-0 -z-10 overflow-hidden" aria-hidden>
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
      {/* keep the headline legible + feather the clip into the near-black canvas */}
      <div className="absolute inset-0 bg-gradient-to-b from-night/55 via-night/20 to-night" />
      <div className="absolute inset-0 bg-[radial-gradient(80%_70%_at_50%_42%,transparent,rgba(16,15,13,0.68))]" />
    </div>
  );
}
