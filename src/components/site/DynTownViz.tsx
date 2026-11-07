import { T } from "@/lib/i18n/i18n";
import { TF } from "@/components/site/DynBits";
import { posKey } from "@/components/site/dynKeys";
import { surnameOf, titleCase, winnersGrid, type Contest } from "@/lib/dynasties";

const COLORS = ["#1b2a4a", "#2b4fa3", "#c4431a", "#2a7f44", "#1f7aaa", "#d2402f", "#7a4fa3", "#8a6d1f"];
const sn = (w: { ballot: string; name: string }) => titleCase(surnameOf(w.ballot) || w.name);

type Seg = { surname?: string; from: number; n: number };
/** Consecutive elections with the same winner surname merge into one segment. Empty = no record. */
function segments(cells: { year: number; winners: { ballot: string; name: string }[] }[]): Seg[] {
  const out: Seg[] = [];
  cells.forEach((c, i) => {
    const s = c.winners[0] ? sn(c.winners[0]) : undefined;
    const last = out.at(-1);
    if (last && last.surname === s) last.n++;
    else out.push({ surname: s, from: i, n: 1 });
  });
  return out;
}

/** Three quick reads for one town: tenure ribbon (who held each seat, when), key facts, competition per election. Surname match only. */
export default function DynTownViz({ contests, years }: { contests: Contest[]; years: number[] }) {
  const grid = winnersGrid(contests, years);
  const all = grid.rows.flatMap((r) => r.cells.flatMap((c) => c.winners.slice(0, 1).map(sn)));
  const color = (s: string) => COLORS[[...new Set(all)].indexOf(s) % COLORS.length];

  const mayor = grid.rows[0];
  const mayorSegs = segments(mayor.cells);
  const people = new Set(contests.filter((c) => c.position === "MAYOR").flatMap((c) => c.winners.map((w) => w.id))).size;
  const longest = mayorSegs.filter((s) => s.surname).sort((a, b) => b.n - a.n)[0];
  const mayors = contests.filter((c) => c.position === "MAYOR").sort((a, b) => a.year - b.year);
  const unc = mayors.filter((c) => c.uncontested).length;
  const maxC = Math.max(...mayors.map((c) => c.candidates), 1);
  const fact = (big: React.ReactNode, label: React.ReactNode) => <div className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm"><p className="font-serif text-3xl font-bold text-fiesta-navy">{big}</p><p className="mt-1 text-sm text-black/70">{label}</p></div>;

  return (
    <div className="space-y-6">
      <div className="grid gap-3 sm:grid-cols-3">
        {fact(String(people), <TF k="dyn.viz.people" v={[mayors.length]} />)}
        {longest ? fact(<TF k="dyn.viz.n" v={[longest.n]} />, <TF k="dyn.viz.longest" v={[longest.surname ?? "", years[longest.from], years[longest.from + longest.n - 1]]} />) : fact("–", <T k="dyn.viz.nodata" />)}
        {fact(<TF k="dyn.viz.unc.big" v={[unc, mayors.length]} />, <T k="dyn.viz.unc" />)}
      </div>

      <figure className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
        <figcaption id="viz-who-cap" className="mb-3 text-sm font-semibold text-fiesta-navy"><T k="dyn.viz.who" /></figcaption>
        <div className="relative overflow-x-auto" tabIndex={0} role="region" aria-labelledby="viz-who-cap"><div className="min-w-[36rem] space-y-3">
          <div className="grid gap-1 pl-24 text-[11px] tabular-nums text-black/60" style={{ gridTemplateColumns: `repeat(${years.length}, 1fr)` }}>{years.map((y) => <span key={y} className="text-center">{y}</span>)}</div>
          {grid.rows.map((r) => (
            <div key={r.position} className="flex items-center gap-2">
              <span className="w-22 shrink-0 text-xs font-semibold text-black/70" style={{ width: "5.5rem" }}><T k={posKey(r.position)} /></span>
              <div className="grid flex-1 gap-1" style={{ gridTemplateColumns: `repeat(${years.length}, 1fr)` }}>
                {segments(r.cells).map((s) => s.surname ? (
                  <span key={s.from} title={`${s.surname}, ${years[s.from]}–${years[s.from + s.n - 1]}`} className="truncate rounded-lg px-2 py-2.5 text-xs font-semibold text-white" style={{ gridColumn: `span ${s.n}`, background: color(s.surname) }}>{s.surname}</span>
                ) : <span key={s.from} className="rounded-lg bg-black/5 py-2.5 text-center text-xs text-black/30" style={{ gridColumn: `span ${s.n}` }}><span aria-hidden>–</span><span className="sr-only"><T k="dyn.viz.nodata" /></span></span>)}
              </div>
            </div>
          ))}
        </div></div>
        <p className="mt-3 text-xs text-black/60"><T k="dyn.viz.legend" /></p>
      </figure>

      {mayors.length > 0 && (
        <figure className="rounded-2xl border border-black/10 bg-white p-4 shadow-sm">
          <figcaption id="viz-cand-cap" className="mb-3 text-sm font-semibold text-fiesta-navy"><T k="dyn.viz.cand" /></figcaption>
          <ul className="flex h-40 items-end gap-2" aria-labelledby="viz-cand-cap">
            {mayors.map((c) => (
              <li key={c.year} className="flex h-full min-w-0 flex-1 flex-col justify-end text-center">
                <span className="text-xs font-semibold tabular-nums">{c.uncontested ? "1" : c.candidates}</span>
                <span className={`mt-1 block rounded-t-md ${c.uncontested ? "bg-fiesta-orange" : "bg-fiesta-blue"}`} style={{ height: `${Math.max((c.uncontested ? 1 : c.candidates) / maxC, 0.06) * 80}%` }} />
                <span className="mt-1 text-[10px] tabular-nums text-black/65">{c.year}</span>
              </li>
            ))}
          </ul>
          <p className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-black/60"><span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-fiesta-blue align-middle" /><T k="dyn.viz.contested" /></span><span><i className="mr-1.5 inline-block h-2.5 w-2.5 rounded-sm bg-fiesta-orange align-middle" /><T k="dyn.viz.uncontested" /></span></p>
        </figure>
      )}
    </div>
  );
}
