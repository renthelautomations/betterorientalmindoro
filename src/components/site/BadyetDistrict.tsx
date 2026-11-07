import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import KitIcon from "@/components/kit/KitIcon";
import SourceLink from "@/components/ui/SourceLink";
import { R, SegBar } from "@/components/site/FinanceBits";
import { plural } from "@/lib/i18n/plural";
import { DASH, fmtPeso, gaaYears, getBadyet, netChange, proportionSegments, shareScale, versions, type District, type Office } from "@/lib/badyet";

const SEG: Record<string, { name: string; color: string; sign: string }> = {
  unchanged: { name: "finance.seg.unchanged", color: "#1b2a4a", sign: "" },
  increased: { name: "finance.seg.increased", color: "#c2410c", sign: "+" },
  house_only: { name: "finance.seg.house_only", color: "#2b4fa3", sign: "" },
  nep_only: { name: "finance.seg.nep_only", color: "#0f766e", sign: "" },
  decreased: { name: "finance.seg.decreased", color: "#2f6b4f", sign: "-" },
  scope_review: { name: "finance.seg.scope_review", color: "#6b6b6b", sign: "" },
};
const STRIPES = "repeating-linear-gradient(45deg, rgba(255,255,255,.85) 0 3px, transparent 3px 6px)";

export function Side({ label, sub, value, note }: { label: string; sub: string; value: number | null; note: React.ReactNode }) {
  return (
    <div className="min-w-0 rounded-2xl bg-[#f3f5f9] p-4">
      <p className="text-sm font-bold text-fiesta-navy"><T k={label} /></p>
      <p className="text-xs text-black/65"><T k={sub} /></p>
      <p className={`mt-3 font-serif text-2xl font-bold tabular-nums sm:text-3xl ${value == null ? "text-black/65" : "text-fiesta-navy"}`}>{fmtPeso(value)}</p>
      <p className="mt-1 text-xs text-black/65">{note}</p>
    </div>
  );
}

export function ProportionBar({ o }: { o: Office }) {
  const seg = proportionSegments(o);
  const total = seg.reduce((a, s) => a + s.rows, 0);
  return (
    <div>
      <SegBar total={total} parts={seg.map((s) => ({ name: SEG[s.key].name, rows: s.rows }))}>
        {seg.map((s) => s.rows > 0 && (
          <span key={s.key} className="flex h-full min-w-1 overflow-hidden" style={{ width: `${s.pct}%`, background: SEG[s.key].color }}>
            {s.unconfirmed_rows > 0 && <span className="ml-auto h-full" style={{ width: `${(s.unconfirmed_rows / s.rows) * 100}%`, backgroundImage: STRIPES }} />}
          </span>
        ))}
      </SegBar>
      <p className="mt-2 text-xs text-black/65"><T k="finance.bar.note" /></p>
      <ul className="mt-3 grid gap-x-6 gap-y-3 sm:grid-cols-2">
        {seg.map((s) => (
          <li key={s.key} className="flex gap-3 text-sm">
            <span aria-hidden className="mt-1 h-3.5 w-3.5 shrink-0 rounded-sm" style={{ background: SEG[s.key].color }} />
            <span className="min-w-0">
              <span className="font-semibold"><T k={SEG[s.key].name} /></span>
              <span className="block tabular-nums text-black/75"><R k={plural(s.rows, "finance.line")} v={[s.rows]} /> · {s.rows === 0 ? DASH : `${SEG[s.key].sign}${fmtPeso(s.php)}`}</span>
              {s.unconfirmed_rows > 0 && <span className="block text-xs font-semibold text-[#9a3f1e]"><R k={plural(s.unconfirmed_rows, "finance.unconf")} v={[s.unconfirmed_rows, fmtPeso(s.unconfirmed_php)]} /></span>}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function GaaBars({ o }: { o: Office }) {
  const ys = gaaYears(o);
  const max = Math.max(...ys.map((y) => y.php ?? 0), 1);
  const row = (y: (typeof ys)[number]) => (
    <li key={y.fy} className="flex items-center gap-2 text-sm">
      <span className="w-10 shrink-0 tabular-nums text-black/70">{y.fy}</span>
      <span className="h-3 min-w-0 flex-1 rounded-sm bg-black/5" aria-hidden><span className="block h-3 rounded-sm bg-fiesta-navy" style={{ width: `${((y.php ?? 0) / max) * 100}%` }} /></span>
      <span className="w-20 shrink-0 text-right tabular-nums">{fmtPeso(y.php)}</span>
    </li>
  );
  const recent = ys.slice(-5).reverse();
  const older = ys.slice(0, -5).reverse();
  return (
    <>
      <ul className="space-y-1.5">{recent.map(row)}</ul>
      {(older.length > 0 || o.by_congress.length > 0) && (
        <details className="mt-3 text-sm">
          <summary className="min-h-11 cursor-pointer py-2 font-semibold text-fiesta-blue underline"><T k="finance.gaa.more" /></summary>
          <ul className="mt-2 space-y-1.5">{older.map(row)}</ul>
          <ul className="mt-3 text-xs text-black/70">
            {o.by_congress.map((c) => <li key={c.congress}><R k="finance.cong" v={[c.congress, c.years_counted.join(", "), fmtPeso(c.gaa_php)]} /></li>)}
          </ul>
        </details>
      )}
    </>
  );
}

/** Per-office source notes, rendered inside the collapsed notes bar. */
export function OfficeNotes({ d }: { d: District }) {
  return (
    <div>
      <p className="font-semibold">{d.label}</p>
      {d.offices.map((o) => {
        const wholeNep = o.years.find((y) => y.stage === "nep")?.php;
        const oc = o.fy2027.office_change;
        return (
          <ul key={o.id} className="mt-1 list-disc space-y-1 pl-5">
            {wholeNep != null && <li><R k="finance.on.nep" v={[o.name, fmtPeso(wholeNep)]} /></li>}
            {oc && oc.rows > 0 && <li><R k={plural(oc.rows, "finance.on.chg")} v={[oc.rows, fmtPeso(oc.nep_php), fmtPeso(oc.hgab3_php)]} /></li>}
            {o.notes.length > 0 && <li><R k="finance.on.src" v={[o.notes.join(" ")]} /></li>}
            <li><R k="finance.on.tier" v={[o.tier_text.toLowerCase()]} /></li>
          </ul>
        );
      })}
    </div>
  );
}

export const NO_SPEND = "Hindi ito ang nagastos. Hindi ito paratang.";

/** The visible honesty line, as a flat calm strip (no accent bar). */
export function NoSpendBanner() {
  return (
    <div role="note" className="mt-5 flex items-center gap-3 rounded-2xl bg-[#e8f3f5] p-4">
      <KitIcon name="shield" variant="badge" color="#1f7a8c" className="h-9 w-9 shrink-0" />
      <p className="font-semibold"><T k="finance.nospend" /></p>
    </div>
  );
}

/** Representative shown neutrally: name, bills filed, and the official House profile. */
export function RepRow({ d }: { d: District }) {
  const r = d.representative;
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl border border-black/10 p-3">
      <KitIcon name="people" variant="badge" color="#1b2a4a" className="h-9 w-9 shrink-0" />
      <div className="min-w-0 flex-1 basis-40">
        <p className="text-xs text-black/65"><T k="finance.rep" /></p>
        <p className="font-semibold leading-tight">{r.name}</p>
        <p className="text-xs text-black/65"><R k={plural(r.bill_count, "finance.rep.bills")} v={[r.bill_count]} /></p>
      </div>
      <SourceLink href={r.profile_url} icon="book"><T k="finance.rep.profile" /></SourceLink>
    </div>
  );
}

function Bar({ label, pct, value, color }: { label: string; pct: number; value: number | null; color: string }) {
  return (
    <li className="grid grid-cols-[4.5rem_1fr_auto] items-center gap-2 text-sm">
      <span className="font-medium"><T k={label} /></span>
      <span aria-hidden className="h-3 rounded-full bg-black/[0.07]"><span className="block h-3 rounded-full" style={{ width: `${pct}%`, background: color }} /></span>
      <span className="min-w-[4.5rem] text-right font-semibold tabular-nums">{fmtPeso(value)}</span>
    </li>
  );
}

/** NEP and House bill totals of an office, side by side. Deliberately never summed. */
export function VersionsPair({ o }: { o: Office }) {
  const v = versions(o);
  const f = o.fy2027;
  const net = netChange(v.nep, v.house);
  const w = shareScale(v.nep, v.house);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Side label="finance.side.nep" sub="finance.side.nep.s" value={v.nep} note={<R k={plural(f.nep_records, "finance.proj")} v={[f.nep_records]} />} />
        <Side label="finance.side.house" sub="finance.side.house.s" value={v.house} note={<R k={plural(f.hgab3_records, "finance.proj.named")} v={[f.hgab3_records]} />} />
      </div>
      <ul className="mt-4 space-y-2">
        <Bar label="finance.side.nep" pct={w.nep} value={v.nep} color="#7f93bd" />
        <Bar label="finance.side.house" pct={w.house} value={v.house} color="#1b2a4a" />
      </ul>
      <p className="mt-1 text-xs text-black/65"><T k="finance.bars.note" /></p>
      <p className="mt-4 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-full bg-[#eef0f4] px-3 py-1 font-semibold tabular-nums text-fiesta-navy">
          <span aria-hidden>{net == null ? "" : net > 0 ? "\u25B2" : net < 0 ? "\u25BC" : "="}</span>
          {net == null ? DASH : `${net > 0 ? "+" : ""}${fmtPeso(net)}`}
        </span>
        <span className="text-black/75"><T k="finance.diff.l" /></span>
      </p>
      <p className="mt-1 text-xs text-black/65"><T k="finance.diff.n" /></p>
    </div>
  );
}

/** Record card on the main page: one district, links to its detail page. */
export function DistrictCard({ d, slug, h }: { d: District; slug: string; h: string /* dictionary key */ }) {
  return (
    <article aria-labelledby={`h-${slug}`} className="flex h-full flex-col gap-5 rounded-2xl border border-black/10 bg-white p-5 sm:p-6">
      <h2 id={`h-${slug}`} className="font-serif text-xl font-bold sm:text-2xl">{d.label}</h2>
      <RepRow d={d} />
      {d.offices.map((o) => (
        <div key={o.id}>
          <p className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-fiesta-navy px-3 py-1 text-xs font-bold text-white">{o.name}</span>
            <span className="text-black/70"><T k="finance.fy.two" /></span>
          </p>
          <VersionsPair o={o} />
          {o.fy2027.unconfirmed_rows > 0 && <p className="mt-3 text-xs font-semibold text-[#9a3f1e]"><R k={plural(o.fy2027.unconfirmed_rows, "finance.unconf")} v={[o.fy2027.unconfirmed_rows, fmtPeso(o.fy2027.unconfirmed_php)]} /></p>}
        </div>
      ))}
      <Link href={`/badyet/${slug}`} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-fiesta-navy px-5 text-sm font-semibold text-white hover:bg-fiesta-blue"><R k="finance.open" v={[<T key="h" k={h} />]} /><KitIcon name="arrow" className="h-4 w-4" /></Link>
    </article>
  );
}

const GROUPS: [string, string][] = [
  ["finance.seg.house_only", "finance.g.house_only"],
  ["finance.seg.nep_only", "finance.g.nep_only"],
  ["finance.seg.unchanged", "finance.g.unchanged"],
  ["finance.seg.changed", "finance.g.changed"],
  ["finance.seg.scope_review", "finance.g.scope_review"],
  ["finance.seg.unconf", "finance.g.unconf"],
];

/** Full notes and disclaimers; shown inside an Accordion, the one-line version stays visible above it. */
export function BadyetNotes({ districts }: { districts: District[] }) {
  const { meta, disclaimers } = getBadyet();
  return (
    <div className="space-y-5">
      <ul className="list-disc space-y-1 pl-5">
        {["n1", "n2", "n3", "n4", "n5", "n6"].map((n) => <li key={n}><R k={`finance.${n}`} /></li>)}
      </ul>
      <div>
        <p className="font-semibold"><T k="finance.groups.h" /></p>
        <dl className="mt-2 space-y-2">{GROUPS.map(([t, b]) => <div key={t}><dt className="font-medium"><T k={t} /></dt><dd className="text-black/70"><T k={b} /></dd></div>)}</dl>
      </div>
      <div className="space-y-3">{districts.map((d) => <OfficeNotes key={d.id} d={d} />)}</div>
      <div className="space-y-2 text-xs text-black/70">
        <p className="font-semibold text-black/85"><T k="finance.up.h" /></p>
        <p>{meta.notice}</p>
        {disclaimers.map((x) => <p key={x.title}><b>{x.title}</b> {x.body} <a className="underline" href={x.url} rel="noopener"><T k="finance.up.read" /></a></p>)}
        <p>{meta.representatives_note}</p>
        <p><T k="finance.up.offices" /></p>
      </div>
    </div>
  );
}
