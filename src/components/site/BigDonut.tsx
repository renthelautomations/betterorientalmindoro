import { FIESTA as F } from "@/components/kit/Patterns";
import { T } from "@/lib/i18n/i18n";
import { DICT } from "@/lib/i18n/dict";
import type { Slice } from "@/components/kit/Charts2";

const CYCLE = [F.blue, F.orange, F.green, F.yellow, F.sky, F.red, F.pink, F.navy];

/** The kit Donut, large, with the legend underneath so a tall side column is filled and balanced. Centre text is sized to fit inside the ring. */
export default function BigDonut({ slices, format, centerLabel }: { slices: Slice[]; format: (n: number) => string; centerLabel: string }) {
  const total = slices.reduce((s, x) => s + x.value, 0) || 1;
  const R = 44, C = 2 * Math.PI * R;
  const starts = slices.map((_, i) => slices.slice(0, i).reduce((a, x) => a + (x.value / total) * C, 0));
  const dict = DICT as Record<string, readonly string[]>;
  const capId = `donut-${centerLabel.replace(/[^a-z0-9]/gi, "-")}`;
  return (
    <div className="flex flex-col items-center gap-6">
      <span id={capId} className="sr-only"><T k={centerLabel} />: {slices.map((s, i) => <span key={s.label}>{i ? ", " : ""}<T k={s.label} /> {format(s.value)}</span>)}</span>
      <svg viewBox="0 0 120 120" className="h-auto w-full max-w-sm -rotate-90" role="img" aria-labelledby={capId}>
        {slices.map((s, i) => {
          const len = (s.value / total) * C;
          return <circle key={s.label} className="anim-dash" cx="60" cy="60" r={R} fill="none" stroke={CYCLE[i % CYCLE.length]} strokeWidth="22" strokeDasharray={`${Math.max(len - 1.5, 0)} ${C}`} strokeDashoffset={-starts[i]}><title>{`${dict[s.label]?.[0] ?? s.label}: ${format(s.value)}`}</title></circle>;
        })}
        <g className="rotate-90" style={{ transformOrigin: "60px 60px" }}>
          <text x="60" y="58" textAnchor="middle" className="fill-[#1b2a4a] text-[10px] font-bold">{format(total)}</text>
          <text x="60" y="68" textAnchor="middle" className="fill-black/60 text-[5px]"><T k={centerLabel} /></text>
        </g>
      </svg>
      <ul className="w-full max-w-sm space-y-2 text-sm">
        {slices.map((s, i) => (
          <li key={s.label} className="flex items-center gap-3"><span className="h-3.5 w-3.5 shrink-0 rounded-sm" style={{ background: CYCLE[i % CYCLE.length] }} /><span><T k={s.label} /></span><span className="ml-auto pl-4 tabular-nums text-black/65">{Math.round((s.value / total) * 100)}%</span></li>
        ))}
      </ul>
    </div>
  );
}
