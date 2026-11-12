import Link from "next/link";
import KitIcon from "@/components/kit/KitIcon";
import { FIESTA } from "@/components/kit/Patterns";
import { shapePath, type Brgy } from "@/lib/barangays";
import { T } from "@/lib/i18n/i18n";
import { TF } from "./DynBits";

const TILE = [FIESTA.blue, FIESTA.green, FIESTA.orange, FIESTA.sky, FIESTA.red, FIESTA.navy];
const hash = (s: string) => [...s].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7);

/** One barangay: its own outline on a brand-colour tile, name, area and how many DPWH projects are placed in it. */
export default function BarangayCard({ b, projects }: { b: Brgy; projects: number }) {
  const bg = TILE[hash(b.code) % TILE.length];
  return (
    <Link href={`/bayan/${b.town}/${b.slug}`} className="group flex h-full items-center gap-3 rounded-xl bg-white p-2.5 shadow-sm ring-1 ring-black/5 transition hover:-translate-y-0.5 hover:shadow-md focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue">
      <svg viewBox="0 0 64 64" className="h-12 w-12 shrink-0 rounded-lg" aria-hidden>
        <rect width="64" height="64" fill={bg} />
        <path d={shapePath(b)} fill={bg === FIESTA.navy ? FIESTA.yellow : "#fff"} fillOpacity=".92" stroke={FIESTA.cream} strokeWidth="1" strokeLinejoin="round" />
      </svg>
      <span className="min-w-0 flex-1">
        <span className="block font-serif text-base font-bold leading-tight text-fiesta-navy">{b.name}</span>
        <span className="mt-0.5 inline-flex rounded-full bg-fiesta-mint px-2 py-0.5 text-[11px] font-semibold text-fiesta-navy">{projects ? <TF k="brg.card.proj" v={[projects]} /> : <T k="brg.card.none" />}</span>
      </span>
      <KitIcon name="arrow" className="h-4 w-4 shrink-0 text-fiesta-navy/40 transition group-hover:translate-x-0.5 group-hover:text-fiesta-navy" />
    </Link>
  );
}
