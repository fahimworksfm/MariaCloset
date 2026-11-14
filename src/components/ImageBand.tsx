/**
 * A full-width editorial image band: one photograph, a near-black scrim that
 * deepens toward the foot, and type set bottom-left over it. Used as the page
 * header on membership and join.
 */
export default function ImageBand({
  src,
  alt = "",
  eyebrow,
  title,
  subtitle,
  as: Heading = "h2",
  heightClass = "h-[52vh] min-h-[340px]",
  className = "",
  priority = false,
}: {
  src: string;
  alt?: string;
  eyebrow?: string;
  title: string;
  subtitle?: string;
  as?: "h1" | "h2";
  heightClass?: string;
  className?: string;
  priority?: boolean;
}) {
  return (
    <section className={`relative overflow-hidden ${heightClass} ${className}`}>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={src}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-night/35 via-night/45 to-night" />
      <div className="relative z-10 mx-auto flex h-full max-w-7xl flex-col justify-end px-5 pb-10 sm:px-8">
        {eyebrow && <p className="kicker">{eyebrow}</p>}
        <Heading className="headline mt-5 max-w-4xl text-[clamp(3rem,8vw,7rem)]">{title}</Heading>
        {subtitle && <p className="mt-6 max-w-lg leading-relaxed text-cream/85">{subtitle}</p>}
      </div>
    </section>
  );
}
