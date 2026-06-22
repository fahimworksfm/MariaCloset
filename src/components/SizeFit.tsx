"use client";

import { useState } from "react";
import type { Item } from "@/lib/types";

export default function SizeFit({ item }: { item: Item }) {
  const fit = item.fit;
  const hasMeasurements = !!(fit && (fit.bust || fit.waist));
  const [bust, setBust] = useState("");
  const [waist, setWaist] = useState("");

  function verdict(): { label: string; tone: string } | null {
    if (!hasMeasurements) return null;
    const b = Number(bust);
    const w = Number(waist);
    if (!b && !w) return null;
    let snug = false;
    let loose = false;
    if (fit?.bust && b) {
      if (b > fit.bust + 1) snug = true;
      else if (b < fit.bust - 3) loose = true;
    }
    if (fit?.waist && w) {
      if (w > fit.waist + 1) snug = true;
      else if (w < fit.waist - 3) loose = true;
    }
    if (snug)
      return { label: "Might be snug — consider sizing up or another piece.", tone: "text-marigold" };
    if (loose) return { label: "Likely roomy — comfortable, maybe a touch loose.", tone: "text-emerald" };
    return { label: "Should fit you beautifully ✓", tone: "text-emerald" };
  }
  const v = verdict();

  return (
    <section className="mt-6">
      <p className="eyebrow mb-2">Size &amp; fit</p>
      <div className="panel p-4">
        {hasMeasurements ? (
          <>
            <div className="flex flex-wrap gap-x-6 gap-y-1 text-sm text-cream/75">
              {fit?.bust ? (
                <span>
                  Bust <b className="text-cream">{fit.bust}&quot;</b>
                </span>
              ) : null}
              {fit?.waist ? (
                <span>
                  Waist <b className="text-cream">{fit.waist}&quot;</b>
                </span>
              ) : null}
              {fit?.length ? (
                <span>
                  Length <b className="text-cream">{fit.length}&quot;</b>
                </span>
              ) : null}
            </div>
            {fit?.note && <p className="mt-1 text-sm text-cream/55">{fit.note}</p>}
            <div className="mt-3 border-t border-gold/10 pt-3">
              <p className="text-sm text-cream/70">Find your fit — your measurements (inches):</p>
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <input
                  className="field max-w-[120px]"
                  inputMode="numeric"
                  value={bust}
                  onChange={(e) => setBust(e.target.value)}
                  placeholder="Bust"
                />
                <input
                  className="field max-w-[120px]"
                  inputMode="numeric"
                  value={waist}
                  onChange={(e) => setWaist(e.target.value)}
                  placeholder="Waist"
                />
              </div>
              {v && <p className={`mt-2 text-sm ${v.tone}`}>{v.label}</p>}
            </div>
          </>
        ) : (
          <p className="text-sm text-cream/70">
            <b className="text-cream">{item.size}</b> — free size and adjustable in the drape, so it
            flatters a wide range of body types.
          </p>
        )}
      </div>
    </section>
  );
}
