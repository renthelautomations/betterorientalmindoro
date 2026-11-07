import Link from "next/link";
import { Badge } from "@/components/kit/Parts";
import type { KitIconName } from "@/components/kit/KitIcon";

export const peso = (n?: number) => (n == null ? "-" : "₱" + Math.round(n).toLocaleString("en-PH"));
export const pesoShort = (n: number) => (n >= 1e9 ? `₱${(n / 1e9).toFixed(2)} B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(1)} M` : peso(n));

export const iconFor = (c?: string): KitIconName => (/Flood/.test(c ?? "") ? "flood" : /Water/.test(c ?? "") ? "drop" : /Road|Bridge/.test(c ?? "") ? "road" : "doc");

export function StatusBadge({ status }: { status?: string }) {
  if (!status) return <Badge kind="soon">Walang katayuan</Badge>;
  return <Badge kind={status === "Completed" ? "verified" : status === "On-Going" ? "new" : "wip"}>{status}</Badge>;
}

/** By-year bars, oldest first. Counts are printed under each bar; each column links to that year's filter. */
export function YearBars({ rows, current, href }: { rows: [number, number][]; current?: number; href: (year?: number) => string }) {
  const max = Math.max(...rows.map((r) => r[1]), 1);
  return (
    <figure>
      <ul className="flex h-44 items-end gap-1.5" aria-label="Bilang ng proyekto kada taon">
        {rows.map(([y, n]) => (
          <li key={y} className="flex h-full min-w-0 flex-1">
            <Link href={href(current === y ? undefined : y)} aria-current={current === y ? "true" : undefined} aria-label={`${y}: ${n} proyekto`} className="group flex h-full w-full flex-col justify-end text-center">
              <span className="text-xs font-semibold tabular-nums">{n}</span>
              <span className={`mt-1 block rounded-t-sm ${current === y ? "bg-fiesta-orange" : "bg-fiesta-blue group-hover:bg-fiesta-navy"}`} style={{ height: `${Math.max((n / max) * 100, 2) * 0.8}%` }} />
              <span className="mt-1 text-[11px] tabular-nums text-black/70">{String(y).slice(2)}</span>
            </Link>
          </li>
        ))}
      </ul>
      <figcaption className="mt-2 text-xs text-black/60">Taon ng proyekto ('16 = 2016). Pindutin ang isang taon para i-filter.</figcaption>
    </figure>
  );
}

