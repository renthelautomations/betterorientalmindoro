import { FIESTA as F } from "./Patterns";

const COLORS = [F.orange, F.blue, F.green, F.yellow, F.pink, F.sky, F.red, F.navy];
const hash = (s: string) => { let h = 2166136261; for (const c of s) h = Math.imul(h ^ c.charCodeAt(0), 16777619); return h >>> 0; };

// Each cell is 32x32. Shape comes from the hash, so a town always gets the same emblem.
const SHAPES: ((c: string) => React.ReactNode)[] = [
  (c) => <path d="M0 0H32A32 32 0 0 1 0 32Z" fill={c} />,
  (c) => <path d="M0 32A16 16 0 0 1 32 32Z" fill={c} />,
  (c) => <path d="M0 32 32 0V32Z" fill={c} />,
  (c) => <>{[8, 16, 24].flatMap((x) => [8, 16, 24].map((y) => <circle key={x + "-" + y} cx={x} cy={y} r="2.200" fill={c} />))}</>,
  (c) => <circle cx="16" cy="16" r="9" fill="none" stroke={c} strokeWidth="5" />,
  (c) => <path d="M16 3 29 16 16 29 3 16Z" fill={c} />,
  (c) => <path d="M0 8H32V14H0ZM0 20H32V26H0Z" fill={c} />,
  (c) => <path d="M16 2 20 12 30 12 22 19 25 30 16 24 7 30 10 19 2 12 12 12Z" fill={c} />, // the star: reserved for the capital
];

/** Placeholder town mark, 2x2 cells. Capital gets a star cell. Not an official coat of arms. */
export default function TownEmblem({ slug, name, className = "h-16 w-16", capital = false }: { slug: string; name: string; className?: string; capital?: boolean }) {
  const h = hash(slug);
  const bg = COLORS[h % COLORS.length];
  const others = COLORS.filter((c) => c !== bg);
  const cells = [0, 1, 2, 3].map((i) => {
    const bits = (h >>> (i * 6 + 3)) & 63;
    return { fill: others[bits % others.length], accent: others[(bits >> 2) % others.length] === others[bits % others.length] ? "#fff" : others[(bits >> 2) % others.length], shape: SHAPES[(bits >> 1) % 7] };
  });
  return (
    <svg viewBox="0 0 64 64" className={`rounded-xl ${className}`} role="img" aria-label={`Emblem ng ${name}`}>
      <title>{name}</title>
      <rect width="64" height="64" fill={bg} />
      {cells.map((c, i) => (
        <g key={i} transform={`translate(${(i % 2) * 32} ${Math.floor(i / 2) * 32})`}>
          <rect width="32" height="32" fill={c.fill} />
          {i === 3 && capital ? SHAPES[7]("#fff") : c.shape(c.accent)}
        </g>
      ))}
    </svg>
  );
}
