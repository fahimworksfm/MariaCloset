/* Festive Bengali / desi decorative motifs. */

export function LotusMark({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
      <path d="M12 3.5C13.7 7 13.7 10 12 13C10.3 10 10.3 7 12 3.5Z" />
      <path d="M12 13C8.8 11.6 5.6 12 3.6 14.4C6.3 16.2 9.6 15.8 12 13Z" />
      <path d="M12 13C15.2 11.6 18.4 12 20.4 14.4C17.7 16.2 14.4 15.8 12 13Z" />
      <path d="M12 13C11.2 9.8 8.6 7.7 5.4 7.4C5.8 10.7 8.4 13 12 13Z" opacity="0.7" />
      <path d="M12 13C12.8 9.8 15.4 7.7 18.6 7.4C18.2 10.7 15.6 13 12 13Z" opacity="0.7" />
    </svg>
  );
}

function Paisley({ flip = false }: { flip?: boolean }) {
  return (
    <g transform={flip ? "scale(-1,1) translate(-40,0)" : undefined}>
      <path
        d="M20 3C10 3 3 11 3 21C3 29 9 35 17 35C11 31 9 25 12 20C14 16.5 19 16 22 19C25 22 23 28 18 29C26 30 34 23 34 14C34 7 28 3 20 3Z"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
      />
      <circle cx="19" cy="13" r="2.4" fill="currentColor" />
    </g>
  );
}

export function PaisleyDivider({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 260 40" className={className} fill="none" aria-hidden="true">
      <g stroke="currentColor" strokeWidth="1.4" strokeLinecap="round">
        <line x1="6" y1="20" x2="74" y2="20" opacity="0.6" />
        <line x1="186" y1="20" x2="254" y2="20" opacity="0.6" />
        <circle cx="80" cy="20" r="2.4" fill="currentColor" stroke="none" />
        <circle cx="180" cy="20" r="2.4" fill="currentColor" stroke="none" />
      </g>
      <g transform="translate(82,2.5)"><Paisley flip /></g>
      <g transform="translate(138,2.5)"><Paisley /></g>
      <g transform="translate(118,6)">
        <path d="M12 0C13.6 4 13.6 8 12 12C10.4 8 10.4 4 12 0Z" fill="currentColor" />
        <path d="M12 12C13.6 16 13.6 20 12 24C10.4 20 10.4 16 12 12Z" fill="currentColor" />
        <circle cx="12" cy="12" r="2.8" fill="currentColor" />
      </g>
    </svg>
  );
}

/** Large radial mandala — faint, slowly rotating backdrop decoration. */
export function Mandala({ className = "" }: { className?: string }) {
  const rot = (k: number) => `rotate(${k} 100 100)`;
  return (
    <svg viewBox="0 0 200 200" className={className} aria-hidden="true">
      <defs>
        <path id="mpet" d="M100 22C111 50 111 74 100 100C89 74 89 50 100 22Z" />
        <path id="mpet2" d="M100 54C106 70 106 84 100 100C94 84 94 70 100 54Z" />
        <circle id="mdot" cx="100" cy="13" r="3" />
      </defs>
      <g fill="none" stroke="currentColor" strokeWidth="1">
        <circle cx="100" cy="100" r="90" />
        <circle cx="100" cy="100" r="68" />
        <circle cx="100" cy="100" r="44" />
      </g>
      <g fill="currentColor" opacity="0.9">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((k) => (
          <use key={k} href="#mpet" transform={rot(k)} />
        ))}
      </g>
      <g fill="currentColor" opacity="0.55">
        {[15, 45, 75, 105, 135, 165, 195, 225, 255, 285, 315, 345].map((k) => (
          <use key={k} href="#mpet2" transform={rot(k)} />
        ))}
      </g>
      <g fill="currentColor">
        {[0, 30, 60, 90, 120, 150, 180, 210, 240, 270, 300, 330].map((k) => (
          <use key={k} href="#mdot" transform={rot(k)} />
        ))}
        <circle cx="100" cy="100" r="9" />
      </g>
    </svg>
  );
}

/** Scalloped gold valance with hanging beads — a decorative awning. */
export function ScallopValance({ className = "" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 1200 60"
      className={className}
      preserveAspectRatio="none"
      aria-hidden="true"
    >
      <defs>
        <pattern id="scallop" width="60" height="60" patternUnits="userSpaceOnUse">
          <path d="M0 0 Q30 46 60 0 Z" fill="currentColor" opacity="0.9" />
          <path d="M0 0 Q30 46 60 0" fill="none" stroke="#FFE39A" strokeWidth="1.5" opacity="0.5" />
          <circle cx="30" cy="50" r="3.4" fill="currentColor" />
        </pattern>
      </defs>
      <rect width="1200" height="60" fill="url(#scallop)" />
    </svg>
  );
}

/** Marigold + mango-leaf hanging garland (toran) that stretches full width. */
export function MarigoldToran({ className = "" }: { className?: string }) {
  const petals = [0, 45, 90, 135, 180, 225, 270, 315].map((a) => {
    const r = (a * Math.PI) / 180;
    return { x: 40 + Math.cos(r) * 14, y: 50 + Math.sin(r) * 14 };
  });
  return (
    <svg
      viewBox="0 0 1200 132"
      className={className}
      preserveAspectRatio="xMidYMin slice"
      aria-hidden="true"
    >
      <defs>
        <pattern id="garland" width="80" height="132" patternUnits="userSpaceOnUse">
          {/* hanging bead between flowers */}
          <line x1="0" y1="6" x2="0" y2="34" stroke="#1F7A43" strokeWidth="2" />
          <circle cx="0" cy="40" r="4.5" fill="#FFC83D" />
          {/* stem */}
          <line x1="40" y1="6" x2="40" y2="34" stroke="#1F7A43" strokeWidth="2.5" />
          {/* mango leaves */}
          <path d="M40 60C28 66 27 84 38 92C42 82 43 70 40 60Z" fill="#2E9E4F" />
          <path d="M40 60C52 66 53 84 42 92C38 82 37 70 40 60Z" fill="#247D40" />
          {/* marigold */}
          {petals.map((p, i) => (
            <circle key={i} cx={p.x} cy={p.y} r="6" fill="#FF7A1A" />
          ))}
          <circle cx="40" cy="50" r="12" fill="#FF9A1F" />
          <circle cx="40" cy="50" r="6.5" fill="#FFC056" />
          <circle cx="40" cy="50" r="3" fill="#C2410C" />
        </pattern>
      </defs>
      <line x1="0" y1="6" x2="1200" y2="6" stroke="#C98A2B" strokeWidth="3" />
      <rect width="1200" height="132" fill="url(#garland)" />
    </svg>
  );
}

/** Corner alpana flourish for panels. */
export function AlpanaCorner({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 60 60" className={className} fill="none" aria-hidden="true">
      <path
        d="M2 2 Q40 2 44 24 Q46 40 30 44 Q18 47 16 34"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
      />
      <circle cx="2" cy="2" r="2.6" fill="currentColor" />
      <path d="M30 14C33 19 33 24 30 29C27 24 27 19 30 14Z" fill="currentColor" opacity="0.85" />
      <circle cx="44" cy="34" r="2.2" fill="currentColor" />
    </svg>
  );
}
