import type { Metadata } from "next";
import Link from "next/link";
import { Crumbs, Title } from "@/components/site/FinanceBits";
import { NoSpendBanner } from "@/components/site/BadyetDistrict";
import RedFlagsList from "@/components/site/RedFlagsList";
import { FlagSvg, ProgLabel } from "@/components/site/RedFlagsBits";
import KitIcon from "@/components/kit/KitIcon";
import SourceLink from "@/components/ui/SourceLink";
import { SourceNote } from "@/components/stats/StatCard";
import { T } from "@/lib/i18n/i18n";
import { TF } from "@/components/site/DynBits";
import { fmtPeso } from "@/lib/badyet";
import { getMunicipalities } from "@/lib/municipalities";
import { byProgram, byTown, getBasket, getMeta, getRows, totals } from "@/lib/redflags";

export const metadata: Metadata = { title: "Red flags sa badyet ng 2027", description: "Mga proyekto sa Oriental Mindoro na kasama sa red-flag basket ng People's Budget Coalition sa 2027 House bill: dalawang bersyon ng badyet, ang bawat proyekto may link sa dokumento. Hindi ito paratang." };

const card = "rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5";
const GROUP_ICON: Record<string, string> = { patronage: "#c4431a", political: "#2b4fa3", infrastructure: "#2a7f44" };

export default function RedFlags() {
  const rows = getRows();
  const meta = getMeta();
  const basket = getBasket();
  const towns = getMunicipalities().map((m) => ({ slug: m.slug, name: m.name }));
  const nameOf = (s: string | null) => towns.find((x) => x.slug === s)?.name;
  const all = totals(rows);
  const progs = byProgram(rows);
  const maxProg = Math.max(...progs.flatMap((p) => [p.t.nep, p.t.house]), 1);
  const tws = byTown(rows);
  const maxTown = Math.max(...tws.map((x) => x.t.projects), 1);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Crumbs items={[{ label: "finance.home", href: "/" }, { label: "nav.budget", href: "/badyet" }, { label: "rf.cta" }]} />
      <div className="mt-4"><Title eyebrow="rf.eyebrow" title="rf.title" /></div>
      <p className="mt-4 max-w-3xl text-black/75"><T k="rf.lead" /></p>
      <NoSpendBanner />
      <section aria-labelledby="disc" className={`${card} mt-5 bg-fiesta-cream`}>
        <h2 id="disc" className="flex items-center gap-2 font-serif text-xl font-bold text-fiesta-navy"><FlagSvg className="h-5 w-5 text-[#7a4a00]" /><T k="rf.disc.h" /></h2>
        <p className="mt-2 text-sm leading-relaxed text-black/80"><T k="rf.disc.p" /></p>
      </section>

      <section aria-labelledby="basket" className="mt-12">
        <h2 id="basket" className="font-serif text-2xl font-bold text-fiesta-navy"><T k="rf.basket.h" /></h2>
        <p className="mt-1 max-w-3xl text-sm text-black/75"><T k="rf.basket.p" /></p>
        <ul className="mt-4 grid gap-4 md:grid-cols-3">
          {basket.groups.map((g) => (
            <li key={g.key} className={`${card} flex flex-col`}>
              <h3 className="font-serif text-lg font-bold leading-snug text-fiesta-navy"><T k={`rf.g.${g.key}`} /></h3>
              <p className="mt-1 text-sm text-black/70"><T k={`rf.g.${g.key}.d`} /></p>
              <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-black/10 pt-3">
                <div><dt className="text-[11px] font-semibold tracking-wide text-black/65 uppercase"><T k="rf.nep" /></dt><dd className="font-serif text-xl font-bold tabular-nums" style={{ color: "#1f7aaa" }}>₱{g.nepB.toLocaleString("en-US", { minimumFractionDigits: 1 })}B</dd></div>
                <div><dt className="text-[11px] font-semibold tracking-wide text-black/65 uppercase"><T k="rf.house" /></dt><dd className="font-serif text-xl font-bold tabular-nums" style={{ color: GROUP_ICON[g.key] }}>₱{g.houseB.toLocaleString("en-US", { minimumFractionDigits: 1 })}B</dd></div>
              </dl>
              <p className="mt-3 text-xs font-semibold text-black/70">{g.localSlice ? <a href="#local" className="text-fiesta-blue underline underline-offset-2"><T k="rf.g.local" /></a> : <T k="rf.g.nolocal" />}</p>
            </li>
          ))}
        </ul>
        <p className="mt-3 flex flex-wrap gap-2">
          <SourceLink href={basket.assessmentUrl} icon="book"><T k="rf.l.pbc" /></SourceLink>
          <SourceLink href={basket.portalUrl} icon="compass"><T k="rf.l.bgpage" /></SourceLink>
        </p>
      </section>

      <section id="local" aria-labelledby="local-h" className="mt-14 scroll-mt-28">
        <h2 id="local-h" className="font-serif text-2xl font-bold text-fiesta-navy"><T k="rf.local.h" /></h2>
        <p className="mt-1 max-w-3xl text-sm text-black/75"><T k="rf.local.p" /></p>
        <dl className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className={card}><dt className="text-xs font-semibold tracking-wide text-black/65 uppercase"><T k="rf.s.projects" /></dt><dd className="mt-1 font-serif text-3xl font-bold tabular-nums text-fiesta-navy">{all.projects.toLocaleString("en-PH")}</dd></div>
          <div className={card}><dt className="text-xs font-semibold tracking-wide text-black/65 uppercase"><T k="rf.s.nep" /></dt><dd className="mt-1 font-serif text-3xl font-bold tabular-nums" style={{ color: "#1f7aaa" }}>{fmtPeso(all.nep)}</dd></div>
          <div className={card}><dt className="text-xs font-semibold tracking-wide text-black/65 uppercase"><T k="rf.s.house" /></dt><dd className="mt-1 font-serif text-3xl font-bold tabular-nums" style={{ color: "#c4431a" }}>{fmtPeso(all.house)}</dd></div>
          <div className={card}><dt className="flex items-center gap-1.5 text-xs font-semibold tracking-wide text-black/65 uppercase"><FlagSvg className="h-4 w-4 text-[#7a4a00]" /><T k="rf.s.houseonly" /></dt><dd className="mt-1 font-serif text-3xl font-bold tabular-nums text-fiesta-navy">{all.houseOnly}</dd>{all.held > 0 && <p className="mt-1 text-xs text-black/65">{all.held} <T k="rf.s.held" /></p>}</div>
        </dl>

        <div className="mt-8 grid items-start gap-6 lg:grid-cols-2">
          <div className={card}>
            <h3 className="font-serif text-lg font-bold text-fiesta-navy"><T k="rf.byprog.h" /></h3>
            <ul className="mt-3 space-y-4">
              {progs.map((p) => (
                <li key={p.program}>
                  <p className="text-sm font-semibold text-fiesta-navy"><ProgLabel program={p.program} /> <span className="font-normal text-black/65">· <TF k="rf.count" v={[p.t.projects]} /></span></p>
                  {([["rf.l.nep", p.t.nep, "#1f7aaa"], ["rf.l.house", p.t.house, "#c4431a"]] as const).map(([k, v, c]) => (
                    <div key={k} className="mt-1.5 grid grid-cols-[5.5rem_1fr_auto] items-center gap-2 text-xs">
                      <span className="text-black/70"><T k={k} /></span>
                      <span className="h-2.5 rounded-full bg-black/5" aria-hidden><span className="block h-full rounded-full" style={{ width: `${Math.max((v / maxProg) * 100, v ? 2 : 0)}%`, background: c }} /></span>
                      <span className="font-semibold tabular-nums">{fmtPeso(v)}</span>
                    </div>
                  ))}
                </li>
              ))}
            </ul>
          </div>
          <div className={card}>
            <h3 className="font-serif text-lg font-bold text-fiesta-navy"><T k="rf.bytown.h" /></h3>
            <p className="mt-1 text-sm text-black/70"><T k="rf.bytown.p" /></p>
            <ul className="mt-3 space-y-2.5">
              {tws.map((x) => (
                <li key={x.town ?? "none"} className="grid grid-cols-[7rem_1fr_auto] items-center gap-2 text-sm">
                  <span className="truncate font-medium">{nameOf(x.town) ?? <T k="rf.untown" />}</span>
                  <span className="h-2.5 rounded-full bg-black/5" aria-hidden><span className="block h-full rounded-full bg-fiesta-navy" style={{ width: `${(x.t.projects / maxTown) * 100}%` }} /></span>
                  <span className="whitespace-nowrap tabular-nums"><b>{x.t.projects}</b>{x.t.houseOnly > 0 && <span className="ml-2 inline-flex items-center gap-1 rounded-full bg-[#fdf0d5] px-2 py-0.5 text-xs font-semibold text-[#7a4a00]"><FlagSvg className="h-3 w-3" />{x.t.houseOnly}</span>}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <h3 className="mt-12 font-serif text-xl font-bold text-fiesta-navy"><T k="rf.list.h" /></h3>
        <div className="mt-3"><RedFlagsList rows={rows} towns={towns} /></div>
      </section>

      <section aria-labelledby="how" className={`${card} mt-12`}>
        <h2 id="how" className="font-serif text-xl font-bold text-fiesta-navy"><T k="rf.how.h" /></h2>
        <ol className="mt-3 space-y-2 text-sm text-black/80">
          {[1, 2, 3, 4].map((n) => <li key={n} className="flex gap-3"><span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-fiesta-navy text-xs font-bold text-white">{n}</span><span className="pt-0.5"><T k={`rf.how.${n}`} /></span></li>)}
        </ol>
      </section>

      <SourceNote><T k="rf.src" /> {meta.builtAt.slice(0, 10)}</SourceNote>
      <div className="mt-3 flex flex-wrap gap-2">
        <SourceLink href={meta.docs} icon="database"><T k="rf.l.docs" /></SourceLink>
        <SourceLink href={`${meta.docs}#mcp`} icon="compass"><T k="rf.l.mcp" /></SourceLink>
        <SourceLink href={meta.repo} icon="github">Source repo</SourceLink>
        <Link href="/badyet" className="inline-flex min-h-11 items-center gap-1 text-sm font-semibold text-fiesta-blue underline underline-offset-2"><KitIcon name="arrow" className="h-4 w-4 rotate-180" /><T k="nav.budget" /></Link>
      </div>
    </main>
  );
}
