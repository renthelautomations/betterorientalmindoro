import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import KitIcon from "@/components/kit/KitIcon";
import { PatternFill, FIESTA, FIESTA_DEEP, type PatternKey } from "@/components/kit/Patterns";
import SourceLink from "@/components/ui/SourceLink";
import { TF } from "@/components/site/DynBits";
import { R, SegBar } from "@/components/site/FinanceBits";
import { plural } from "@/lib/i18n/plural";
import { DASH, budgetChecks, fmtPeso, gaaYears, getBadyet, proportionSegments, shareScale, versions, type District, type Office } from "@/lib/badyet";

const SEG: Record<string, { name: string; color: string; sign: string }> = {
  unchanged: { name: "finance.seg.unchanged", color: FIESTA.navy, sign: "" },
  increased: { name: "finance.seg.increased", color: FIESTA_DEEP.orange, sign: "+" },
  house_only: { name: "finance.seg.house_only", color: FIESTA.blue, sign: "" },
  nep_only: { name: "finance.seg.nep_only", color: FIESTA_DEEP.sky, sign: "" },
  decreased: { name: "finance.seg.decreased", color: FIESTA_DEEP.green, sign: "-" },
  scope_review: { name: "finance.seg.scope_review", color: "#6b6b6b", sign: "" },
};
const STRIPES = "repeating-linear-gradient(45deg, rgba(255,255,255,.85) 0 3px, transparent 3px 6px)";

// The two versions keep one colour each everywhere: tile, bar and legend. NEP is sky blue, the House bill is orange.
export const TONE = {
  nep: { fg: FIESTA_DEEP.sky, bg: "#e7f1f8" },
  house: { fg: FIESTA_DEEP.orange, bg: "#fbece5" },
} as const;

/** Patterned colour band, the same device as the service cards: a slim block with the district or office name in white. */
export function PatternBand({ color, pattern, children }: { color: string; pattern: PatternKey; children: React.ReactNode }) {
  return (
    <div className="overflow-hidden text-white" style={{ background: color }}>
      <div className="relative h-10" aria-hidden><PatternFill variant={pattern} colors={["#fff"]} opacity={0.16} /></div>
      <div className="p-5 sm:px-6">{children}</div>
    </div>
  );
}
export const DISTRICT_LOOK: { color: string; pattern: PatternKey }[] = [{ color: FIESTA.blue, pattern: "mosaic" }, { color: FIESTA_DEEP.orange, pattern: "burst" }];

export function Side({ label, sub, value, note, tone }: { label: string; sub: string; value: number | null; note: React.ReactNode; tone: keyof typeof TONE }) {
  const c = TONE[tone];
  return (
    <div className="min-w-0 rounded-2xl p-4" style={{ background: c.bg }}>
      <div className="flex items-start justify-between gap-2">
        <div><p className="text-sm font-bold text-fiesta-navy"><T k={label} /></p><p className="text-xs text-black/65"><T k={sub} /></p></div>
        <KitIcon name="budget" variant="duo" color={c.fg} className="h-6 w-6 shrink-0" />
      </div>
      <p className={`mt-3 font-serif text-2xl font-bold tabular-nums sm:text-3xl ${value == null ? "text-black/65" : ""}`} style={value == null ? undefined : { color: c.fg }}>{fmtPeso(value)}</p>
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
  return (
    <>
      {/* One shared scale for every year. A year with no data shows a dash and no bar, never a zero-height bar. */}
      <ul className="flex h-52 items-stretch gap-1.5 rounded-2xl bg-fiesta-cream p-3 sm:gap-3 sm:p-4">
        {ys.map((y, i) => (
          <li key={y.fy} className="flex min-w-0 flex-1 flex-col items-center justify-end gap-1 text-center">
            <span className={`text-[11px] font-semibold tabular-nums sm:text-xs ${y.php == null ? "text-black/65" : "text-fiesta-navy"}`}>{fmtPeso(y.php)}</span>
            {y.php != null && <span aria-hidden className={`w-full max-w-12 rounded-t-md ${i === ys.length - 1 ? "bg-fiesta-orange" : "bg-fiesta-blue"}`} style={{ height: `${Math.max((y.php / max) * 100, 2) * 0.62}%` }} />}
            <span className="border-t border-black/15 pt-1 text-xs tabular-nums text-black/75">{y.fy}</span>
          </li>
        ))}
      </ul>
      {o.by_congress.length > 0 && (
        <ul className="mt-4 space-y-0.5 text-xs text-black/70">
          {o.by_congress.map((c) => <li key={c.congress}><R k="finance.cong" v={[c.congress, c.years_counted.join(", "), fmtPeso(c.gaa_php)]} /></li>)}
        </ul>
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
    <div className="flex flex-wrap items-center gap-x-3 gap-y-2 rounded-2xl bg-fiesta-cream p-3">
      <KitIcon name="people" variant="badge" color={FIESTA.blue} className="h-9 w-9 shrink-0" />
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


const FlagSvg = ({ className = "h-5 w-5" }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 21V4" /><path d="M5 4h11l-2 4 2 4H5" /></svg>;
const CheckSvg = ({ className = "h-5 w-5" }: { className?: string }) => <svg viewBox="0 0 24 24" className={className} fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M5 12.5l4.5 4.5L19 7.5" /></svg>;

/** Plain checks with a status icon: a check when things agree, an amber flag when the versions differ or a match is uncertain, a dash when a figure is missing. */
export function Checks({ o }: { o: Office }) {
  const rows = budgetChecks(o).map((c) => {
    if (c.id === "totals") return { level: c.level, text: c.level === "ok" ? <T k="uxd.chk.totals.ok" /> : c.level === "unknown" ? <T k="uxd.chk.totals.unk" /> : <TF k={c.diff! > 0 ? "uxd.chk.totals.hi" : "uxd.chk.totals.lo"} v={[fmtPeso(Math.abs(c.diff!))]} /> };
    if (c.id === "projects") return { level: c.level, text: c.level === "ok" ? <TF k="uxd.chk.proj.ok" v={[c.nep]} /> : <TF k="uxd.chk.proj.flag" v={[c.nep, c.house]} /> };
    return { level: c.level, text: c.level === "ok" ? <T k="uxd.chk.unc.ok" /> : <TF k="uxd.chk.unc.flag" v={[c.rows, fmtPeso(c.php)]} /> };
  });
  const flags = rows.filter((r) => r.level === "flag").length;
  return (
    <section aria-label="Checks" className="rounded-2xl bg-fiesta-cream p-4">
      <p className="flex items-center justify-between gap-2 text-sm font-bold text-fiesta-navy"><T k="uxd.chk.h" />{flags > 0 && <span className="inline-flex items-center gap-1 rounded-full bg-[#fdf0d5] px-2.5 py-0.5 text-xs font-bold text-[#7a4a00]"><FlagSvg className="h-3.5 w-3.5" />{flags}</span>}</p>
      <ul className="mt-3 space-y-2">
        {rows.map((r, i) => (
          <li key={i} className="flex items-start gap-3 text-sm">
            <span className={`mt-0.5 flex h-7 w-7 shrink-0 items-center justify-center rounded-full ${r.level === "ok" ? "bg-[#dff1e4] text-[#1f6b37]" : r.level === "flag" ? "bg-[#fdf0d5] text-[#7a4a00]" : "bg-black/10 text-black/65"}`}>
              {r.level === "ok" ? <CheckSvg className="h-4 w-4" /> : r.level === "flag" ? <FlagSvg className="h-4 w-4" /> : <span aria-hidden className="text-base leading-none">–</span>}
              <span className="sr-only"><T k={r.level === "ok" ? "uxd.chk.okl" : r.level === "flag" ? "uxd.chk.flag" : "uxd.chk.unk"} />: </span>
            </span>
            <span className="min-w-0 pt-0.5">{r.text}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-xs text-black/65"><T k="uxd.chk.note" /> <T k="finance.diff.n" /></p>
    </section>
  );
}

/** NEP and House bill totals of an office, side by side. Deliberately never summed. */
export function VersionsPair({ o }: { o: Office }) {
  const v = versions(o);
  const f = o.fy2027;
  const w = shareScale(v.nep, v.house);
  return (
    <div>
      <div className="grid grid-cols-2 gap-3">
        <Side tone="nep" label="finance.side.nep" sub="finance.side.nep.s" value={v.nep} note={<R k={plural(f.nep_records, "finance.proj")} v={[f.nep_records]} />} />
        <Side tone="house" label="finance.side.house" sub="finance.side.house.s" value={v.house} note={<R k={plural(f.hgab3_records, "finance.proj.named")} v={[f.hgab3_records]} />} />
      </div>
      <ul className="mt-4 space-y-2">
        <Bar label="finance.side.nep" pct={w.nep} value={v.nep} color={TONE.nep.fg} />
        <Bar label="finance.side.house" pct={w.house} value={v.house} color={TONE.house.fg} />
      </ul>
      <p className="mt-1 text-xs text-black/65"><T k="finance.bars.note" /></p>
      <div className="mt-4"><Checks o={o} /></div>
    </div>
  );
}

/** Record card on the main page: one district, links to its detail page. */
export function DistrictCard({ d, slug, h, i = 0 }: { d: District; slug: string; h: string /* dictionary key */; i?: number }) {
  return (
    <article aria-labelledby={`h-${slug}`} className="flex h-full flex-col overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <header className="flex items-center gap-3 border-b border-black/10 px-5 py-4 sm:px-6">
        <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-fiesta-navy font-serif text-lg font-bold text-white" aria-hidden>{i + 1}</span>
        <h2 id={`h-${slug}`} className="font-serif text-xl font-bold text-fiesta-navy sm:text-2xl">{d.label}</h2>
      </header>
      <div className="flex flex-1 flex-col gap-5 p-5 sm:p-6">
      <RepRow d={d} />
      {d.offices.map((o) => (
        <div key={o.id}>
          <p className="mb-3 flex flex-wrap items-center gap-2 text-sm">
            <span className="rounded-full bg-fiesta-navy px-3 py-1 text-xs font-bold text-white">{o.name}</span>
            <span className="text-black/70"><T k="finance.fy.two" /></span>
          </p>
          <VersionsPair o={o} />
        </div>
      ))}
      <Link href={`/badyet/${slug}`} className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-full bg-fiesta-navy px-5 text-sm font-semibold text-white hover:bg-fiesta-blue"><R k="finance.open" v={[<T key="h" k={h} />]} /><KitIcon name="arrow" className="h-4 w-4" /></Link>
      </div>
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
