import { fmtInt } from "@/lib/stats";

/** Tiny SVG trend with first and last values as text. Starts at zero so growth is not exaggerated. */
export default function Sparkline({ points, label }: { points: { year: number; value: number }[]; label: string }) {
  if (points.length < 2) return <p className="text-sm text-black/60">Walang sapat na datos.</p>;
  const W = 240, H = 64, max = Math.max(...points.map((p) => p.value));
  const x0 = points[0].year, x1 = points.at(-1)!.year;
  const pts = points.map((p) => `${(((p.year - x0) / (x1 - x0)) * (W - 8) + 4).toFixed(1)},${(H - 4 - (p.value / max) * (H - 8)).toFixed(1)}`);
  const first = points[0], last = points.at(-1)!;
  return (
    <figure>
      <svg viewBox={`0 0 ${W} ${H}`} className="h-16 w-full max-w-60" role="img" aria-label={`${label}: ${first.year} ${fmtInt(first.value)}, ${last.year} ${fmtInt(last.value)}`}>
        <polyline points={pts.join(" ")} fill="none" stroke="#2b4fa3" strokeWidth="2.500" strokeLinejoin="round" strokeLinecap="round" />
        <circle cx={pts.at(-1)!.split(",")[0]} cy={pts.at(-1)!.split(",")[1]} r="3.500" fill="#2b4fa3" />
      </svg>
      <figcaption className="mt-1 text-sm text-black/70">{first.year}: <b className="tabular-nums">{fmtInt(first.value)}</b> → {last.year}: <b className="tabular-nums">{fmtInt(last.value)}</b></figcaption>
    </figure>
  );
}
