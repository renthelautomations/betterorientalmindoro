import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import KitIcon from "@/components/kit/KitIcon";
import GovFlagCard from "./GovFlagCard";
import GovProcNoAward, { type NoAwardRow } from "./GovProcNoAward";
import { Bars, card } from "./GovProcBits";
import { RULES, groupFlags, plainTitle, slugRef } from "@/lib/gov-proc";
import { summarizeFlags, type Flag } from "@/lib/gov-flags";

const ISSUES = "https://github.com/renthelautomations/betterorientalmindoro/issues/new";
const LAWS = [
  { label: "RA 12009 New Government Procurement Act", url: "https://lawphil.net/statutes/repacts/ra2024/ra_12009_2024.html" },
  { label: "RA 9184 Government Procurement Reform Act", url: "https://lawphil.net/statutes/repacts/ra2003/ra_9184_2003.html" },
  { label: "PhilGEPS", url: "https://www.philgeps.gov.ph/" },
  { label: "Commission on Audit", url: "https://www.coa.gov.ph/" },
];
const H2 = "font-serif text-2xl font-bold text-fiesta-navy";

function Method() {
  return (
    <section aria-labelledby="method" className={`${card} p-6`}>
      <h2 id="method" className={H2}><T k="govb.m.h" /></h2>
      <p className="mt-2 max-w-3xl text-black/80"><T k="govb.m.intro" /></p>
      <h3 className="mt-5 font-serif text-lg font-bold text-fiesta-navy"><T k="govb.m.rules" /></h3>
      <ul className="mt-2 space-y-2 text-sm text-black/80">{RULES.map((r) => <li key={r}><span className="font-semibold text-fiesta-navy"><T k={`govb.rule.${r}`} />.</span> <T k={`govb.rule.${r}.d`} /></li>)}</ul>
      {(["source", "misread", "verify", "report"] as const).map((k) => (
        <div key={k}><h3 className="mt-5 font-serif text-lg font-bold text-fiesta-navy"><T k={`govb.m.${k}.h`} /></h3><p className="mt-2 max-w-3xl text-sm text-black/80"><T k={`govb.m.${k}`} />{k === "report" && <> <a href={ISSUES} target="_blank" rel="noopener noreferrer" className="font-semibold text-fiesta-blue underline underline-offset-2">GitHub issues</a>.</>}</p></div>
      ))}
      <h3 className="mt-5 font-serif text-lg font-bold text-fiesta-navy"><T k="govb.m.law" /></h3>
      <ul className="mt-2 flex flex-wrap gap-2">{LAWS.map((l) => <li key={l.url}><a href={l.url} target="_blank" rel="noopener noreferrer" className="inline-flex min-h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-fiesta-navy shadow-sm ring-1 ring-black/10 hover:ring-fiesta-navy/40 focus-visible:outline-2 focus-visible:outline-fiesta-blue">{l.label}</a></li>)}</ul>
    </section>
  );
}

/** Notes page body. Rule groups: no-award-listed as a compact table; other per-project rules as cards (first few, rest folded); aggregates once. */
export default function GovProcNotes({ flags, titles }: { flags: Flag[]; titles: Record<string, string> }) {
  const s = summarizeFlags(flags);
  const { byRule } = groupFlags(flags);
  const rows: NoAwardRow[] = (byRule["no-award-listed"] ?? []).map((f) => ({ ref: f.refNo ?? "", slug: slugRef(f.refNo ?? ""), title: titles[f.refNo ?? ""] ?? plainTitle(f.evidence[0]?.quote ?? ""), date: typeof f.evidence[0]?.value === "string" ? f.evidence[0].value : null }));
  const sample = byRule["no-award-listed"]?.[0];
  return (
    <div className="space-y-8">
      <Method />
      <section aria-labelledby="counts" className={`${card} p-6`}>
        <h2 id="counts" className={H2}><T k="govb.c.h" /></h2>
        <p className="mt-2 text-sm text-black/80"><T k="govb.c.total" /> {s.total.toLocaleString("en-PH")} · <T k="govb.sev.info" /> {s.bySeverity.info.toLocaleString("en-PH")} · <T k="govb.sev.review" /> {s.bySeverity.review.toLocaleString("en-PH")}</p>
        <div className="mt-4"><Bars title="govb.c.byrule" rows={RULES.map((r) => ({ key: r, label: `govb.rule.${r}`, n: s.byRule[r] ?? 0 }))} /></div>
      </section>
      {RULES.map((r) => {
        const fs = byRule[r] ?? [];
        const agg = fs.filter((f) => !f.refNo), per = fs.filter((f) => f.refNo);
        return (
          <section key={r} aria-labelledby={`r-${r}`}>
            <h2 id={`r-${r}`} className={H2}><T k={`govb.rule.${r}`} /> <span className="ml-1 rounded-full bg-black/5 px-2.5 py-1 align-middle font-sans text-sm font-semibold tabular-nums text-black/70">{fs.length.toLocaleString("en-PH")}</span></h2>
            <p className="mt-2 max-w-3xl text-sm text-black/75"><T k={`govb.rule.${r}.d`} /></p>
            {fs.length === 0 ? <p className={`${card} mt-3 flex items-center gap-2 text-sm text-black/75`}><KitIcon name="check" className="h-5 w-5 text-fiesta-green" /><T k="govb.c.none" /></p> : (
              <div className="mt-3 space-y-3">
                {r === "no-award-listed" ? <GovProcNoAward rows={rows} notes={{ title: sample?.title ?? "", disclaimer: sample?.disclaimer ?? "" }} /> : (
                  <>
                    {agg.map((f) => <GovFlagCard key={f.id} flag={f} />)}
                    {per.slice(0, 5).map((f) => <GovFlagCard key={f.id} flag={f} />)}
                    {per.length > 5 && (
                      <details className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
                        <summary className="flex min-h-11 cursor-pointer items-center text-sm font-semibold text-fiesta-navy focus-visible:outline-2 focus-visible:outline-fiesta-blue"><T k="govb.c.showall" /> ({per.length - 5})</summary>
                        <div className="mt-3 space-y-3">{per.slice(5).map((f) => <GovFlagCard key={f.id} flag={f} />)}</div>
                      </details>
                    )}
                  </>
                )}
              </div>
            )}
          </section>
        );
      })}
      <p className="text-sm text-black/70"><Link href="/pamahalaan" className="font-semibold text-fiesta-blue underline underline-offset-2"><T k="govb.back" /></Link></p>
    </div>
  );
}
