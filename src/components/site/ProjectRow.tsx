import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import KitIcon from "@/components/kit/KitIcon";
import { cleanTitle, projectDigest } from "@/lib/projects";
import { StatusBadge, iconFor, pesoShort } from "./ProjectBits";

/** At-a-glance project row: what (work + place) and how much first, status and year as chips, full title muted below. max (optional) draws a cost bar relative to the biggest in the list. */
export default function ProjectRow({ id, title, bayan, year, status, cost, category, max }: { id: string; title: string; bayan?: string; year?: number; status?: string; cost?: number; category?: string; max?: number }) {
  const d = projectDigest(title);
  const full = cleanTitle(title);
  return (
    <Link href={`/proyekto/${id}`} className="group flex h-full items-start gap-4 rounded-2xl border border-black/10 bg-white p-4 shadow-sm transition hover:border-fiesta-navy/40 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue">
      <KitIcon name={iconFor(category)} variant="badge" color="#1b2a4a" className="h-11 w-11 shrink-0" />
      <div className="min-w-0 flex-1">
        <p className="line-clamp-3 font-semibold leading-snug text-fiesta-navy" title={full}>{d.headline ?? full}</p>
        <p className="mt-1.5 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-black/70">
          <StatusBadge status={status} />
          <span className="font-medium text-black/80">{bayan ?? <T k="proyekto.unsure" />}</span>
          {year && <span className="tabular-nums">{year}</span>}
          {d.segments > 1 && <span>{d.segments} <T k="proyekto.segments" /></span>}
        </p>
        {d.headline && <p className="mt-1.5 line-clamp-2 text-xs text-black/55" title={full}>{full}</p>}
      </div>
      <div className="w-24 shrink-0 text-right sm:w-32">
        <p className="font-serif text-lg font-bold tabular-nums text-fiesta-navy sm:text-xl">{cost != null ? pesoShort(cost) : "–"}</p>
        {max && cost != null ? <span className="mt-1.5 block h-1.5 overflow-hidden rounded-full bg-black/5" aria-hidden><span className="block h-full rounded-full bg-fiesta-orange" style={{ width: `${Math.max((cost / max) * 100, 3)}%` }} /></span> : <span className="text-[11px] text-black/55">published na budget</span>}
      </div>
      <KitIcon name="arrow" className="mt-3 hidden h-5 w-5 shrink-0 text-black/30 transition group-hover:translate-x-0.5 group-hover:text-fiesta-navy sm:block" />
    </Link>
  );
}
