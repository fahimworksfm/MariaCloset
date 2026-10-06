/* Monochrome theme: the desi decorative motifs are retired. Only the logo mark
 * remains; the rest are kept as no-op stubs so existing usages render nothing
 * without needing edits across every page. */

type OrnProps = { className?: string };

/** The lotus logo's paths (24×24 box) — shared by the navbar mark and the app icons. */
export const LOTUS_PATHS: { d: string; opacity?: number }[] = [
  { d: "M12 3.5C13.7 7 13.7 10 12 13C10.3 10 10.3 7 12 3.5Z" },
  { d: "M12 13C8.8 11.6 5.6 12 3.6 14.4C6.3 16.2 9.6 15.8 12 13Z" },
  { d: "M12 13C15.2 11.6 18.4 12 20.4 14.4C17.7 16.2 14.4 15.8 12 13Z" },
  { d: "M12 13C11.2 9.8 8.6 7.7 5.4 7.4C5.8 10.7 8.4 13 12 13Z", opacity: 0.7 },
  { d: "M12 13C12.8 9.8 15.4 7.7 18.6 7.4C18.2 10.7 15.6 13 12 13Z", opacity: 0.7 },
];

export function LotusMark({ className = "" }: OrnProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      {LOTUS_PATHS.map((p) => (
        <path key={p.d} d={p.d} opacity={p.opacity} />
      ))}
    </svg>
  );
}

export function PaisleyDivider(props: OrnProps) {
  void props;
  return null;
}
export function Mandala(props: OrnProps) {
  void props;
  return null;
}
export function ScallopValance(props: OrnProps) {
  void props;
  return null;
}
export function MarigoldToran(props: OrnProps) {
  void props;
  return null;
}
export function AlpanaCorner(props: OrnProps) {
  void props;
  return null;
}
