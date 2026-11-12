import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import TownEmblem from "./TownEmblem";
import { fmtInt } from "@/lib/stats";

export type TownCard = { slug: string; name: string; isCity: boolean; population: number | null };

/** Town picker as cards: emblem, name, population and a bar sized against the largest town. Plain links, no JS. */
export default function TownGrid({ towns }: { towns: TownCard[] }) {
  const max = Math.max(...towns.map((t) => t.population ?? 0), 1);
  return (
    <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
      {towns.map((t) => (
        <li key={t.slug}>
          <Link href={`/bayan/${t.slug}`} className="group flex items-center gap-4 rounded-2xl bg-white p-3 pr-4 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-fiesta-blue">
            <TownEmblem slug={t.slug} name="" className="h-16 w-16 shrink-0 transition group-hover:scale-105" capital={t.slug === "calapan-city"} />
            <span className="min-w-0 flex-1">
              <span className="flex items-baseline justify-between gap-2"><span className="truncate font-serif text-lg font-bold">{t.name}</span><span className="shrink-0 text-xs font-semibold text-black/65"><T k={t.isCity ? "town.city" : "town.town"} /></span></span>
              <span className="mt-1.5 block h-2 rounded-full bg-black/5" aria-hidden><span className="block h-2 rounded-full bg-fiesta-blue transition-[width]" style={{ width: `${Math.max(((t.population ?? 0) / max) * 100, 3)}%` }} /></span>
              <span className="mt-1 block text-xs tabular-nums text-black/65">{t.population == null ? "-" : <>{fmtInt(t.population)} <T k="town.people" /></>}</span>
            </span>
          </Link>
        </li>
      ))}
    </ul>
  );
}
