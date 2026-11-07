import { FIESTA as F } from "./Patterns";
import { T } from "@/lib/i18n/i18n";
import { DICT } from "@/lib/i18n/dict";

const CYCLE = [F.blue, F.orange, F.green, F.yellow, F.sky, F.red, F.pink, F.navy];

// ---------- Donut ----------
export type Slice = { label: string; value: number };
export function Donut({ slices, format, centerLabel }: { slices: Slice[]; format: (n: number) => string; centerLabel: string }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const R = 44, C = 2 * Math.PI * R;
  const starts = slices.map((_, i) => slices.slice(0, i).reduce((a, x) => a + (x.value / total) * C, 0));
  return (
    <div className="flex flex-wrap items-center gap-6">
      <svg viewBox="0 0 120 120" className="h-44 w-44 shrink-0 -rotate-90" role="img" aria-label={`${(DICT as Record<string, readonly string[]>)[centerLabel]?.[0] ?? centerLabel}: ${slices.map((s) => `${s.label} ${format(s.value)}`).join(", ")}`}>
        {slices.map((s, i) => {
          const len = (s.value / total) * C, off = starts[i];
          return <circle key={s.label} className="anim-dash" cx="60" cy="60" r={R} fill="none" stroke={CYCLE[i % CYCLE.length]} strokeWidth="22" strokeDasharray={`${Math.max(len - 1.5, 0)} ${C}`} strokeDashoffset={-off}><title>{`${s.label}: ${format(s.value)}`}</title></circle>;
        })}
        <g className="rotate-90 origin-center" style={{ transformOrigin: "60px 60px" }}>
          <text x="60" y="58" textAnchor="middle" className="fill-[#1b2a4a] text-[11px] font-bold">{format(total)}</text>
          <text x="60" y="72" textAnchor="middle" className="fill-black/60 text-[7px]"><T k={centerLabel} /></text>
        </g>
      </svg>
      <ul className="space-y-1.5 text-sm">
        {slices.map((s, i) => (
          <li key={s.label} className="flex items-center gap-2"><span className="h-3 w-3 rounded-sm" style={{ background: CYCLE[i % CYCLE.length] }} /><span>{s.label}</span><span className="ml-auto pl-4 tabular-nums text-black/70">{Math.round((s.value / total) * 100)}%</span></li>
        ))}
      </ul>
    </div>
  );
}

// ---------- Treemap (squarified) ----------
type Rect = { x: number; y: number; w: number; h: number; item: Slice };
export function squarify(items: Slice[], w: number, h: number): Rect[] {
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  let rest = [...items].filter((i) => i.value > 0).sort((a, b) => b.value - a.value).map((i) => ({ i, a: (i.value / total) * w * h }));
  const out: Rect[] = [];
  let x = 0, y = 0, W = w, H = h;
  while (rest.length) {
    const short = Math.min(W, H);
    const worst = (r: typeof rest, s: number) => {
      const mx = Math.max(...r.map((z) => z.a)), mn = Math.min(...r.map((z) => z.a));
      return Math.max((short * short * mx) / (s * s), (s * s) / (short * short * mn));
    };
    let row = [rest[0]], sum = rest[0].a, k = 1;
    while (k < rest.length && worst([...row, rest[k]], sum + rest[k].a) <= worst(row, sum)) { row = [...row, rest[k]]; sum += rest[k].a; k++; }
    const thick = sum / short;
    let off = 0;
    for (const z of row) {
      const len = z.a / thick;
      out.push(W >= H ? { x, y: y + off, w: thick, h: len, item: z.i } : { x: x + off, y, w: len, h: thick, item: z.i });
      off += len;
    }
    if (W >= H) { x += thick; W -= thick; } else { y += thick; H -= thick; }
    rest = rest.slice(row.length);
  }
  return out;
}
export function Treemap({ items, format }: { items: Slice[]; format: (n: number) => string }) {
  const W = 900, H = 320;
  return (
    <div className="overflow-x-auto"><svg viewBox={`0 0 ${W} ${H}`} className="mx-auto h-auto w-full min-w-[620px] max-w-4xl" role="img" aria-label={items.map((s) => `${s.label} ${format(s.value)}`).join(", ")}>
      {squarify(items, W, H).map((r, i) => {
        const dark = [F.yellow, F.pink, F.sky].includes(CYCLE[i % CYCLE.length] as never);
        const big = r.w > 90 && r.h > 42;
        return (
          <g key={r.item.label}>
            <rect className="anim-fade" x={r.x + 1} y={r.y + 1} width={Math.max(r.w - 2, 0)} height={Math.max(r.h - 2, 0)} rx="4" fill={CYCLE[i % CYCLE.length]}><title>{`${r.item.label}: ${format(r.item.value)}`}</title></rect>
            {big && (
              <text x={r.x + 10} y={r.y + 22} className="text-[13px] font-semibold" fill={dark ? F.navy : "#fff"}>
                {r.item.label.length * 8.5 > r.w - 20 ? r.item.label.slice(0, Math.max(Math.floor((r.w - 20) / 8.5) - 1, 3)) + "…" : r.item.label}<tspan x={r.x + 10} dy="17" className="text-[12px] font-normal">{format(r.item.value)}</tspan>
              </text>
            )}
          </g>
        );
      })}
    </svg></div>
  );
}

// ---------- Timeline ----------
export type TimelineItem = { year: string | number; title: string; sub?: string };
export function Timeline({ items }: { items: TimelineItem[] }) {
  return (
    <ol className="relative ml-3 border-l-2 border-[#1b2a4a]/15">
      {items.map((it, i) => (
        <li key={String(it.year) + it.title} className="relative pb-6 pl-7 last:pb-0">
          <span className="absolute -left-[9px] top-1.5 h-4 w-4 rounded-full ring-4 ring-[#fbf7f0]" style={{ background: CYCLE[i % 4] }} aria-hidden />
          <p className="font-serif text-xl font-bold text-[#1b2a4a]">{it.year}</p>
          <p className="font-semibold">{it.title}</p>
          {it.sub && <p className="text-sm text-black/65">{it.sub}</p>}
        </li>
      ))}
    </ol>
  );
}
