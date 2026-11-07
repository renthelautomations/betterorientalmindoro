import { R } from "@/components/site/FinanceBits";
import { fmtInt, fmtPct, popGrowth, type PopPoint } from "@/lib/stats";

/** Horizontal CSS bars with the value as text, so it reads without sight of the bars. */
export default function PopTrend({ points }: { points: PopPoint[] }) {
  const max = Math.max(...points.map((p) => p.value), 1);
  const g = popGrowth(points);
  return (
    <div>
      <ul className="space-y-1.5">
        {points.map((p) => (
          <li key={p.year} className="grid grid-cols-[3rem_1fr_5.5rem] items-center gap-2 text-sm">
            <span className="text-black/70">{p.year}</span>
            <span className="h-3 rounded-sm bg-black/5" aria-hidden>
              <span className="block h-3 rounded-sm bg-[#1b2a4a]" style={{ width: `${(p.value / max) * 100}%` }} />
            </span>
            <span className="text-right tabular-nums">{fmtInt(p.value)}</span>
          </li>
        ))}
      </ul>
      {g !== null && (
        <p className="mt-2 text-sm text-black/70">
          <R k="finance.pop.growth" v={[points[0].year, points[points.length - 1].year]} /> <strong>{g >= 0 ? "+" : ""}{fmtPct(g)}</strong>
        </p>
      )}
    </div>
  );
}
