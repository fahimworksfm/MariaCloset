/** A few slow, muted petals for a hint of life. Deterministic (no random)
 *  so server and client markup match. */

const COLORS = ["#C9A24B", "#A8536B", "#D9C28A"];

// left%, size, duration(s), delay(s), starting rotation
const PETALS: [number, number, number, number, number][] = [
  [9, 14, 26, 0, 20],
  [27, 12, 32, 8, 120],
  [48, 15, 28, 16, 250],
  [68, 11, 34, 5, 80],
  [85, 13, 30, 12, 190],
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
            opacity: 0.5,
          }}
        >
          <svg viewBox="0 0 20 25" width="100%" height="100%">
            <path
              d="M10 0C16.5 8 16.5 17 10 25C3.5 17 3.5 8 10 0Z"
              fill={COLORS[i % COLORS.length]}
            />
          </svg>
        </div>
      ))}
    </div>
  );
}
