import { T } from "@/lib/i18n/i18n";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import type { PmcProject } from "@/lib/pmc";
import { TF } from "./DynBits";

// Client-safe (no data imports): used by the town tab list and by barangay pages.
export const fmtDate = (d: string | null) => (d ? new Date(d).toLocaleDateString("en-PH", { year: "numeric", month: "short", day: "numeric", timeZone: "Asia/Manila" }) : "–");
export const peso = (n: number) => (n >= 1e9 ? `₱${(n / 1e9).toFixed(2)}B` : n >= 1e6 ? `₱${(n / 1e6).toFixed(2)}M` : `₱${Math.round(n).toLocaleString("en-PH")}`);
export const TONE = { completed: FIESTA_DEEP.green, ongoing: FIESTA.blue, other: "#6b7280" } as const;
export const lastOf = (p: PmcProject) => p.inspections.at(-1)!;

/** One project: place and money, how far along the committee found it on each visit, what it found, and where else the same project shows up. */
export function PmcCard({ p, names }: { p: PmcProject; names: Record<string, string> }) {
  const last = lastOf(p), c = TONE[last.state];
  const lines = [...last.findings.map((t) => ({ t, k: "f" })), ...last.recommendation.map((t) => ({ t, k: "r" }))];
  return (
    <li className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="px-5 pb-4 pt-5">
        <div className="flex flex-wrap items-center gap-2">
          <span className="rounded-full px-3 py-1 text-xs font-bold text-white" style={{ background: c }}>{last.state === "completed" ? <T k="pmc.done" /> : last.state === "ongoing" ? <T k="pmc.going" /> : <T k="pmc.other" />}{last.progress != null ? ` · ${last.progress}%` : ""}</span>
          {last.withFindings && <span className="rounded-full bg-fiesta-yellow/40 px-3 py-1 text-xs font-bold text-fiesta-navy"><T k="pmc.withfind" /></span>}
          {p.fund && <span className="rounded-full bg-fiesta-mint px-3 py-1 text-xs font-semibold text-fiesta-navy">{p.fund}</span>}
        </div>
        <h3 className="mt-3 font-serif text-xl font-bold leading-snug text-fiesta-navy">{p.project}</h3>
        <p className="mt-1 text-sm text-black/75">{p.contractor ?? "-"} · <b className="text-fiesta-navy">{peso(p.cost)}</b></p>
        {p.barangays.length > 0 && <p className="mt-2 flex flex-wrap gap-1.5">{p.barangays.map((b) => <span key={b} className="rounded-full bg-fiesta-cream px-2.5 py-0.5 text-xs font-medium text-fiesta-navy">{names[b] ?? b}</span>)}</p>}
        <span className="mt-4 block h-2 overflow-hidden rounded-full bg-black/10" aria-hidden><span className="block h-full rounded-full" style={{ width: `${Math.min(last.progress ?? 0, 100)}%`, background: c }} /></span>
        <ol className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-xs text-black/70">
          {p.inspections.map((i, n) => <li key={n} className="tabular-nums"><a href={i.url} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2 hover:text-fiesta-blue">{fmtDate(i.date)}</a>{i.progress != null ? ` · ${i.progress}%` : ""}</li>)}
        </ol>
      </div>
      {lines.length > 0 && (
        <details className="group border-t border-black/10 bg-fiesta-cream/60 px-5 py-3 text-sm">
          <summary className="cursor-pointer list-none font-semibold text-fiesta-navy [&::-webkit-details-marker]:hidden"><span className="mr-1 inline-block transition group-open:rotate-90" aria-hidden>›</span><T k="pmc.latest" /> ({fmtDate(last.date)})</summary>
          <ul className="mt-2 space-y-1.5 text-black/80">{lines.map((l, i) => <li key={i} className="flex gap-2"><span className="mt-0.5 shrink-0 rounded px-1.5 text-[10px] font-bold uppercase text-white" style={{ background: l.k === "f" ? FIESTA.orange : FIESTA_DEEP.green }}>{l.k === "f" ? <T k="pmc.f" /> : <T k="pmc.r" />}</span><span>{l.t}</span></li>)}</ul>
        </details>
      )}
      {(p.philgeps.length > 0 || p.bidDocs.length > 0) && (
        <div className="border-t border-black/10 px-5 py-3 text-xs text-black/75">
          {p.philgeps.map((m) => <p key={m.awardRef}><b className="text-fiesta-navy"><T k="pmc.phil" /></b> {m.awardee} · {peso(m.amount)} · {fmtDate(m.awardDate)} <span className="text-black/60">({m.nameMatch && m.amountMatch ? <T k="pmc.m.both" /> : m.amountMatch ? <T k="pmc.m.amt" /> : <T k="pmc.m.name" />})</span></p>)}
          {p.bidDocs.length > 0 && <p className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1"><b className="text-fiesta-navy"><T k="pmc.docs" /></b>{p.bidDocs.map((b) => <a key={b.url} href={b.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-fiesta-blue underline underline-offset-2">{b.kind} ↗</a>)}</p>}
        </div>
      )}
    </li>
  );
}

