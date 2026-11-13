import { T } from "@/lib/i18n/i18n";
import KitIcon from "@/components/kit/KitIcon";
import { FIESTA, FIESTA_DEEP, PatternFill } from "@/components/kit/Patterns";
import { getPmc, lastInspection, type PmcProject, type PmcFlag } from "@/lib/pmc";
import { getMunicipalities } from "@/lib/municipalities";
import { getAllBarangays } from "@/lib/barangays";
import { fmtPeso } from "@/lib/stats";
import { TF } from "./DynBits";

import { fmtDate } from "./PmcCard";
import PmcList from "./PmcList";

const mo = (a: string, b: string) => Math.max(1, Math.round((Date.parse(b) - Date.parse(a)) / 2_629_800_000));
const FLAG: Record<PmcFlag["type"], { color: string; label: string; icon: "alert" | "doc" | "road" | "pin" | "budget" | "mountain" }> = {
  claim100: { color: FIESTA.red, label: "pmc.fl.t.claim", icon: "alert" }, longrun: { color: FIESTA.blue, label: "pmc.fl.t.long", icon: "road" },
  billboard: { color: FIESTA.yellow, label: "pmc.fl.t.bill", icon: "doc" }, nwrb: { color: FIESTA.sky, label: "pmc.fl.t.nwrb", icon: "mountain" },
  unfinished: { color: FIESTA.orange, label: "pmc.fl.t.unf", icon: "budget" }, defects: { color: FIESTA_DEEP.green, label: "pmc.fl.t.def", icon: "alert" },
};
/** One "worth a look" card: coloured band with the kind, one big number, the plain sentence, and a dated link with page for each piece of evidence. */
function Flag({ f }: { f: PmcFlag }) {
  const c = FLAG[f.type], ev = f.evidence.slice(0, 6), dark = f.type === "billboard";
  const hero = f.type === "claim100" ? "100%" : f.type === "longrun" ? `${mo(f.first!, f.last!)} mo` : f.type === "unfinished" ? fmtPeso(f.cost ?? 0) : String(f.projects ?? 0);
  return (
    <li className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
      <div className="relative isolate flex items-center gap-2 px-5 py-3" style={{ background: c.color, color: dark ? FIESTA.navy : "#fff" }}>
        <PatternFill variant="wave" colors={[dark ? FIESTA.navy : "#fff"]} opacity={dark ? 0.12 : 0.24} />
        <KitIcon name={c.icon} className="relative h-5 w-5" />
        <p className="relative text-xs font-bold uppercase tracking-widest"><T k={c.label} /></p>
      </div>
      <div className="flex flex-1 flex-col p-5">
        <p className="font-serif text-4xl font-bold leading-none text-fiesta-navy tabular-nums">{hero}</p>
        <p className="mt-2 font-semibold leading-snug text-fiesta-navy">
          {f.type === "claim100" && <T k="pmc.fl.claim" />}
          {f.type === "longrun" && <TF k="pmc.fl.long" v={[f.visits ?? 0, f.project ?? "", mo(f.first!, f.last!)]} />}
          {f.type === "billboard" && <TF k="pmc.fl.bill" v={[f.projects ?? 0]} />}
          {f.type === "nwrb" && <TF k="pmc.fl.nwrb" v={[f.projects ?? 0]} />}
          {f.type === "unfinished" && <TF k="pmc.fl.unf" v={[f.projects ?? 0]} />}
          {f.type === "defects" && <TF k="pmc.fl.def" v={[f.projects ?? 0, f.withFindings ?? 0]} />}
        </p>
        {f.type === "claim100" && f.quote?.[0] && <p className="mt-2 rounded-xl bg-fiesta-cream px-3 py-2 text-sm italic text-black/80">“{f.quote[0]}”</p>}
        {f.type === "claim100" && f.denyFinalPayment && <p className="mt-2 text-sm text-black/75"><T k="pmc.fl.deny" /></p>}
        {f.type === "longrun" && f.progress && (
          <div className="mt-3" aria-label={f.progress.join("%, ") + "%"}>
            <div className="flex h-14 items-end gap-1" aria-hidden>{f.progress.map((v, i) => <span key={i} className="flex-1 rounded-t" style={{ height: `${Math.max(v, 4)}%`, background: v >= 100 ? FIESTA_DEEP.green : c.color, opacity: v >= 100 ? 1 : 0.85 }} />)}</div>
            <p className="mt-1 text-[11px] text-black/65"><T k="pmc.fl.prog" /> {f.progress.length} <T k="pmc.fl.visits" /></p>
          </div>
        )}
        {f.type === "unfinished" && <p className="mt-2 text-sm text-black/75"><T k="pmc.fl.unf.p" /></p>}
        {ev.length > 0 && <p className="mt-auto flex flex-wrap gap-1.5 pt-4">{ev.map((e, i) => <a key={i} href={e.page ? `${e.url}#page=${e.page}` : e.url} target="_blank" rel="noopener noreferrer" className="rounded-full bg-fiesta-cream px-3 py-1 text-xs font-semibold text-fiesta-navy transition hover:bg-fiesta-blue hover:text-white" title={e.project}>{fmtDate(e.date)}{e.page ? ` · p. ${e.page}` : ""} ↗</a>)}</p>}
      </div>
    </li>
  );
}

/** Town tab: what the Project Monitoring Committee found on its site visits. */
export default function PmcInspections({ slug }: { slug: string }) {
  const pmc = getPmc(slug);
  if (!pmc) return null;
  const names = Object.fromEntries(getAllBarangays().filter((b) => b.town === slug).map((b) => [b.code, b.name]));
  const projects = [...pmc.projects].sort((a, b) => (lastInspection(b).date ?? "").localeCompare(lastInspection(a).date ?? ""));
  const done = projects.filter((p) => lastInspection(p).state === "completed").length, find = projects.filter((p) => p.inspections.some((i) => i.withFindings)).length;
  const dead = pmc.documents.filter((d) => !d.ok);
  const town = getMunicipalities().find((m) => m.slug === slug)?.name ?? slug;
  return (
    <div className="space-y-6">
      <p className="max-w-3xl text-black/75"><TF k="pmc.lead" v={[town, pmc.documents.length]} /></p>
      {pmc.flags.length > 0 && (
        <section aria-labelledby="pmc-flags">
          <h3 id="pmc-flags" className="font-serif text-2xl font-bold text-fiesta-navy"><T k="pmc.fl.h" /></h3>
          <p className="mt-1 max-w-3xl text-sm text-black/70"><T k="pmc.fl.p" /></p>
          <ul className="mt-4 grid gap-3 md:grid-cols-2 lg:grid-cols-3">{pmc.flags.map((f, i) => <Flag key={i} f={f} />)}</ul>
        </section>
      )}
      <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[["pmc.n.projects", projects.length], ["pmc.n.reports", pmc.documents.length - dead.length], ["pmc.n.done", done], ["pmc.n.find", find]].map(([k, v]) => (
          <div key={k as string} className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5"><dt className="text-xs font-semibold uppercase tracking-widest text-black/65"><T k={k as string} /></dt><dd className="mt-1 font-serif text-3xl font-bold text-fiesta-navy tabular-nums">{v}</dd></div>
        ))}
      </dl>
      <PmcList projects={projects} names={names} />
      {dead.length > 0 && (
        <div className="rounded-2xl bg-fiesta-mint p-5 text-sm">
          <p className="flex items-center gap-2 font-semibold text-fiesta-navy"><KitIcon name="alert" className="h-5 w-5" /><T k="pmc.dead.h" /></p>
          <p className="mt-1 text-black/75"><T k="pmc.dead.p" /> {dead.map((d) => d.label).join(", ")}.</p>
        </div>
      )}
      <p className="text-xs text-black/65"><a href={pmc.source.split(" ")[0]} rel="noopener" className="font-semibold text-fiesta-blue underline underline-offset-2"><T k="common.source" /></a> · <T k="pmc.note" /> {pmc.fetchedAt}</p>
    </div>
  );
}
