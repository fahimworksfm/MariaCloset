/** Drifting marigold + rani petals for festive ambiance. Deterministic
 *  configs (no random) so server and client markup match. */

const COLORS = ["#FF9A1F", "#FF2E88", "#FFC83D", "#FF6A13", "#12C2B4"];

// left%, size, duration(s), delay(s), starting rotation
const PETALS: [number, number, number, number, number][] = [
  [4, 16, 13, 0, 10],
  [12, 22, 17, 5, 60],
  [21, 13, 11, 2, 120],
  [29, 19, 15, 8, 200],
  [38, 24, 19, 1, 300],
  [46, 14, 12, 6, 40],
  [54, 20, 16, 3, 150],
  [62, 16, 14, 9, 250],
  [70, 23, 18, 4, 80],
  [78, 13, 11, 7, 330],
  [86, 19, 15, 2, 20],
  [93, 21, 17, 10, 190],
  [16, 12, 13, 11, 90],
  [50, 15, 20, 13, 260],
  [83, 17, 14, 12, 130],
];

export default function Petals() {
  return (
    <div className="pointer-events-none fixed inset-0 z-0 overflow-hidden" aria-hidden="true">
      {PETALS.map(([left, size, dur, delay, rot], i) => (
        <div
          key={i}
          className="petal"
          style={{
            left: `${left}%`,
            width: size,
            height: size * 1.25,
            animationDuration: `${dur}s`,
            animationDelay: `${delay}s`,
            transform: `rotate(${rot}deg)`,
            opacity: 0.85,
          }}
        >
          <svg viewBox="0 0 20 25" width="100%" height="100%">
            <path
              d="M10 0C16.5 8 16.5 17 10 25C3.5 17 3.5 8 10 0Z"
              fill={COLORS[i % COLORS.length]}
            />
            <path d="M10 2C13 8 13 16 10 23" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" />
          </svg>
        </div>
      ))}
    </div>
  );
}
