import { FIESTA as F } from "@/components/kit/Patterns";

const COLORS = [F.orange, F.blue, F.green, F.yellow, F.pink, F.sky, F.red, F.navy];
// Big shape (top-left) and small accent (bottom-right) on a 64x64 tile. Two shapes only, so it stays simpler than a town emblem.
const BIG: ((c: string) => React.ReactNode)[] = [
  (c) => <path d="M0 0H44A44 44 0 0 1 0 44Z" fill={c} />,
  (c) => <path d="M6 64A26 26 0 0 1 58 64Z" fill={c} />,
  (c) => <path d="M30 6 52 28 30 50 8 28Z" fill={c} />,
  (c) => <circle cx="26" cy="26" r="14" fill="none" stroke={c} strokeWidth="9" />,
];
const SMALL: ((c: string) => React.ReactNode)[] = [
  (c) => <path d="M64 34V64H34Z" fill={c} />,
  (c) => <path d="M38 44H64V50H38ZM38 55H64V61H38Z" fill={c} />,
  (c) => <>{[44, 53, 62].flatMap((x) => [44, 53, 62].map((y) => <circle key={x + "-" + y} cx={x - 2} cy={y - 2} r="2.4" fill={c} />))}</>,
  (c) => <rect x="40" y="40" width="20" height="20" rx="4" fill={c} />,
];

/** Menu tile in the town-emblem family: one coloured square, one big shape, one small accent. Each index gives a different combination. */
export default function MenuEmblem({ index, className = "h-14 w-14" }: { index: number; className?: string }) {
  const bg = COLORS[index % COLORS.length];
  const others = COLORS.filter((c) => c !== bg);
  const c1 = others[(index * 2 + 1) % others.length];
  let c2 = others[(index * 3 + 2) % others.length];
  if (c2 === c1) c2 = others[(others.indexOf(c1) + 1) % others.length];
  return (
    <svg viewBox="0 0 64 64" className={`shrink-0 rounded-xl ${className}`} aria-hidden>
      <rect width="64" height="64" fill={bg} />
      {BIG[Math.floor(index / 2) % BIG.length](c1)}
      {SMALL[Math.floor(index / 3) % SMALL.length](c2)}
    </svg>
  );
}
