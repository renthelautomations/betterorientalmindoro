import Link from "next/link";
import TownEmblem from "@/components/kit/TownEmblem";
import { StatCard } from "@/components/kit/Parts";
import { Breadcrumbs } from "@/components/kit/Ui";
import { Divider } from "@/components/kit/Motifs";
import { FIESTA } from "@/components/kit/Patterns";
import { getBayanSummary } from "@/lib/bayan";
import { getStats, fmtInt } from "@/lib/stats";

export type BayanTab = "buod" | "tulong" | "proyekto" | "halalan" | "datos";
const TABS: { id: BayanTab; label: string; path: string }[] = [
  { id: "buod", label: "Buod", path: "" },
  { id: "tulong", label: "Tulong", path: "/tulong" },
  { id: "proyekto", label: "Proyekto", path: "/proyekto" },
  { id: "halalan", label: "Halalan", path: "/halalan" },
  { id: "datos", label: "Datos", path: "/datos" },
];

/** Tabs that are real links. Same classes as the kit Tabs so they look identical. */
export function LinkTabs({ slug, active }: { slug: string; active: BayanTab }) {
  return (
    <nav aria-label="Mga seksyon ng bayan" className="flex gap-1 overflow-x-auto border-b border-black/10">
      {TABS.map((t) => (
        <Link key={t.id} href={`/bayan/${slug}${t.path}`} aria-current={active === t.id ? "page" : undefined}
          className={`inline-flex min-h-11 shrink-0 items-center border-b-4 px-4 text-sm font-semibold ${active === t.id ? "border-fiesta-orange text-fiesta-navy" : "border-transparent text-black/60 hover:text-fiesta-navy"}`}>{t.label}</Link>
      ))}
    </nav>
  );
}

/** Header, stat strip and link tabs shared by the five bayan routes. */
export default function BayanFrame({ slug, active, children }: { slug: string; active: BayanTab; children: React.ReactNode }) {
  const s = getBayanSummary(slug)!;
  const last = getStats(slug)?.population.at(-1);
  const ic = getStats(slug)?.incomeClass;
  return (
    <main>
      <div className="bg-fiesta-mint">
        <div className="mx-auto max-w-6xl px-4 pb-10 pt-8">
          <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Bayan", href: "/bayan" }, { label: s.name }]} />
          <div className="mt-6 flex flex-wrap items-center gap-5">
            <TownEmblem slug={slug} name={s.name} className="h-24 w-24 shrink-0" capital={slug === "calapan-city"} />
            <div>
              <h1 className="font-serif text-4xl font-bold md:text-5xl">{s.name}</h1>
              <p className="mt-1 text-black/70">{s.incomeClass ? `${s.incomeClass[0].toUpperCase()}${s.incomeClass.slice(1)} · ` : ""}{s.barangays} barangay · {s.areaKm2.toLocaleString("en-PH")} km²</p>
            </div>
          </div>
        </div>
      </div>
      <Divider variant="mahaltana" />
      <div className="mx-auto max-w-6xl px-4 py-8">
        <section aria-label="Sa numero" className="grid gap-4 sm:grid-cols-3">
          <StatCard label="POPULASYON" value={fmtInt(s.population)} hint={last ? `Census ${last.year}` : "Walang datos"} icon="people" />
          <StatCard label="KLASE NG KITA" value={s.incomeClass?.replace(" klase", "") ?? "-"} hint={ic ? `Taon ${ic.year}` : "Walang datos"} icon="budget" color={FIESTA.blue} />
          <StatCard label="PROYEKTO NG DPWH" value={s.projectCount ? fmtInt(s.projectCount) : "-"} hint={s.projectCount ? "Natukoy ang bayan" : "Walang natukoy na proyekto"} icon="road" color={FIESTA.red} />
        </section>
        <div className="mt-8"><LinkTabs slug={slug} active={active} /></div>
        <div className="pt-6">{children}</div>
      </div>
    </main>
  );
}

export const SeeAll = ({ href, children }: { href: string; children: React.ReactNode }) => (
  <Link href={href} className="mt-3 inline-flex min-h-11 items-center text-sm font-semibold text-fiesta-blue underline underline-offset-2">{children} →</Link>
);
