import { getInvestment } from "@/lib/gov";
import { T } from "@/lib/i18n/i18n";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";

const TONE = [FIESTA.blue, FIESTA_DEEP.green, FIESTA_DEEP.orange, FIESTA.navy, FIESTA_DEEP.sky, FIESTA.red];

/** Invest tab: the province's own six-sector pitch, as published. Labelled as theirs; we add no claims. */
export default function GovInvestment() {
  const ds = getInvestment();
  return (
    <div className="space-y-5">
      <p className="max-w-3xl rounded-2xl bg-fiesta-mint/60 p-4 text-sm text-black/80"><T k="govc.iv.note" /></p>
      <ul className="grid gap-4 md:grid-cols-2">
        {ds.items.map((s, i) => (
          <li key={s.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
            <div className="flex items-center gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-serif text-lg font-bold text-white" style={{ background: TONE[i % TONE.length] }} aria-hidden>{s.n}</span>
              <div><h2 className="font-serif text-xl font-bold leading-snug text-fiesta-navy">{s.sector}</h2>{s.note && <p className="text-sm text-black/65">{s.note}</p>}</div>
            </div>
            <h3 className="mt-4 text-xs font-semibold tracking-widest text-black/60 uppercase"><T k="govc.iv.opp" /></h3>
            <p className="mt-1 text-sm text-black/80">{s.opportunities}</p>
            <h3 className="mt-3 text-xs font-semibold tracking-widest text-black/60 uppercase"><T k="govc.iv.why" /></h3>
            <p className="mt-1 text-sm text-black/80">{s.why}</p>
          </li>
        ))}
      </ul>
      <p><a href={ds.source} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center text-sm font-semibold text-fiesta-blue underline"><T k="govc.iv.src" /> ↗</a></p>
    </div>
  );
}
