// Decorative SVG produce illustrations used to warm up the marketing page.
// Each icon is self-contained, styled via inline fills so it works regardless
// of text color context.

type DecorProps = {
  size?: number;
  className?: string;
  style?: React.CSSProperties;
};

export function Tomato({ size = 72, className, style }: DecorProps) {
  return (
    <svg
      viewBox="0 0 72 72"
      width={size}
      height={size}
      className={className}
      style={style}
    >
      <circle cx="36" cy="42" r="24" fill="#d64828" />
      <circle cx="28" cy="36" r="4" fill="#ff7050" opacity="0.4" />
      <path
        d="M20 20 Q30 14 36 18 Q42 14 52 20 Q46 26 36 26 Q26 26 20 20 Z"
        fill="#5c7540"
      />
      <path
        d="M36 18 L36 26"
        stroke="#3f5530"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Carrot({ size = 72, className, style }: DecorProps) {
  return (
    <svg
      viewBox="0 0 72 72"
      width={size}
      height={size}
      className={className}
      style={style}
    >
      <path
        d="M36 12 L24 20 L22 14 L28 10 Z M36 12 L48 20 L50 14 L44 10 Z M36 12 L36 8 L40 14 Z"
        fill="#5c7540"
      />
      <path d="M20 24 L52 24 L36 64 Z" fill="#e8623d" />
      <path
        d="M28 32 L30 34 M34 40 L36 42 M40 32 L42 34"
        stroke="#b94818"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function PeaPod({ size = 72, className, style }: DecorProps) {
  return (
    <svg
      viewBox="0 0 72 72"
      width={size}
      height={size}
      className={className}
      style={style}
    >
      <path
        d="M12 40 Q12 20 36 16 Q60 20 60 40 Q52 48 36 48 Q20 48 12 40 Z"
        fill="#7a9154"
      />
      <circle cx="24" cy="34" r="5" fill="#a4b67a" />
      <circle cx="36" cy="32" r="5.5" fill="#a4b67a" />
      <circle cx="48" cy="34" r="5" fill="#a4b67a" />
      <circle cx="22" cy="32" r="1.5" fill="#e8edd5" />
      <circle cx="34" cy="30" r="1.5" fill="#e8edd5" />
      <circle cx="46" cy="32" r="1.5" fill="#e8edd5" />
    </svg>
  );
}

export function Strawberry({ size = 72, className, style }: DecorProps) {
  return (
    <svg
      viewBox="0 0 72 72"
      width={size}
      height={size}
      className={className}
      style={style}
    >
      <path
        d="M18 28 Q18 20 28 18 Q36 12 44 18 Q54 20 54 28 Q54 50 36 62 Q18 50 18 28 Z"
        fill="#d64828"
      />
      <path
        d="M20 20 Q28 12 36 16 Q44 12 52 20 Q44 22 36 18 Q28 22 20 20 Z"
        fill="#5c7540"
      />
      {[
        [26, 32],
        [36, 34],
        [46, 32],
        [30, 42],
        [40, 42],
        [36, 50],
      ].map(([x, y], i) => (
        <ellipse
          key={i}
          cx={x}
          cy={y}
          rx="1.5"
          ry="2.5"
          fill="#f8dfa4"
          transform={`rotate(${i * 30} ${x} ${y})`}
        />
      ))}
    </svg>
  );
}

export function Leaf({ size = 72, className, style }: DecorProps) {
  return (
    <svg
      viewBox="0 0 72 72"
      width={size}
      height={size}
      className={className}
      style={style}
    >
      <path
        d="M10 60 Q10 18 56 14 Q60 46 22 62 Z"
        fill="#7a9154"
      />
      <path
        d="M18 58 Q30 40 50 22"
        stroke="#3f5530"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Lemon({ size = 72, className, style }: DecorProps) {
  return (
    <svg
      viewBox="0 0 72 72"
      width={size}
      height={size}
      className={className}
      style={style}
    >
      <ellipse cx="36" cy="38" rx="24" ry="20" fill="#edbd5c" />
      <circle cx="28" cy="32" r="3" fill="#f8dfa4" opacity="0.6" />
      <path d="M12 38 L8 40 Z M60 38 L64 40 Z" fill="#edbd5c" />
      <path
        d="M16 28 Q22 20 30 22"
        stroke="#b9891a"
        strokeWidth="1.5"
        fill="none"
        strokeLinecap="round"
      />
    </svg>
  );
}

export function Sprig({ size = 72, className, style }: DecorProps) {
  return (
    <svg
      viewBox="0 0 72 72"
      width={size}
      height={size}
      className={className}
      style={style}
    >
      <path
        d="M36 6 L36 66"
        stroke="#3f5530"
        strokeWidth="2"
        strokeLinecap="round"
      />
      {[12, 20, 28, 36, 44, 52].map((y, i) => {
        const side = i % 2 === 0 ? 1 : -1;
        return (
          <path
            key={i}
            d={`M36 ${y} Q${36 + side * 16} ${y - 6} ${36 + side * 20} ${y + 4}`}
            stroke="#5c7540"
            strokeWidth="2"
            fill="#7a9154"
            strokeLinecap="round"
          />
        );
      })}
    </svg>
  );
}

export function Broccoli({ size = 72, className, style }: DecorProps) {
  return (
    <svg
      viewBox="0 0 72 72"
      width={size}
      height={size}
      className={className}
      style={style}
    >
      <path
        d="M28 40 L44 40 L40 62 L32 62 Z"
        fill="#e8d9ad"
      />
      <circle cx="24" cy="28" r="12" fill="#5c7540" />
      <circle cx="36" cy="20" r="14" fill="#7a9154" />
      <circle cx="48" cy="28" r="12" fill="#5c7540" />
      <circle cx="30" cy="34" r="10" fill="#5c7540" />
      <circle cx="42" cy="34" r="10" fill="#7a9154" />
      <circle cx="22" cy="24" r="2" fill="#a4b67a" opacity="0.5" />
      <circle cx="36" cy="16" r="2" fill="#a4b67a" opacity="0.5" />
      <circle cx="46" cy="24" r="2" fill="#a4b67a" opacity="0.5" />
    </svg>
  );
}

/**
 * Renders a cluster of produce illustrations absolute-positioned as a playful
 * background. The parent needs `position: relative` and usually
 * `overflow: hidden`.
 */
export function ProduceScatter({
  className,
  opacity = 1,
}: {
  className?: string;
  opacity?: number;
}) {
  return (
    <div
      aria-hidden
      className={`pointer-events-none absolute inset-0 ${className ?? ""}`}
      style={{ opacity }}
    >
      <Tomato
        size={86}
        style={{ position: "absolute", top: "6%", left: "4%", transform: "rotate(-12deg)" }}
      />
      <Carrot
        size={68}
        style={{ position: "absolute", top: "18%", right: "8%", transform: "rotate(16deg)" }}
      />
      <PeaPod
        size={96}
        style={{ position: "absolute", bottom: "10%", left: "8%", transform: "rotate(8deg)" }}
      />
      <Strawberry
        size={70}
        style={{ position: "absolute", bottom: "18%", right: "6%", transform: "rotate(-14deg)" }}
      />
      <Leaf
        size={56}
        style={{ position: "absolute", top: "48%", left: "22%", transform: "rotate(-40deg)" }}
      />
      <Lemon
        size={60}
        style={{ position: "absolute", top: "54%", right: "26%", transform: "rotate(20deg)" }}
      />
    </div>
  );
}
