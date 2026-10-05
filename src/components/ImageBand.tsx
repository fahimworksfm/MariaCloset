/**
 * A full-width editorial image band: one photograph, a soft near-black scrim,
 * and centred type over it. Used for page headers and the homepage break.
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
      <div className="absolute inset-0 bg-gradient-to-b from-night/40 via-night/45 to-night" />
      <div className="relative z-10 flex h-full flex-col items-center justify-center px-5 text-center">
        {eyebrow && <p className="eyebrow">{eyebrow}</p>}
        <Heading className="mt-4 max-w-3xl font-display text-4xl font-light leading-tight text-zari sm:text-6xl">
          {title}
        </Heading>
        {subtitle && (
          <p className="mx-auto mt-5 max-w-md text-[15px] leading-relaxed text-cream/65">{subtitle}</p>
        )}
      </div>
    </section>
  );
}
