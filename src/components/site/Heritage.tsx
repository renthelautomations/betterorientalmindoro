import { T } from "@/lib/i18n/i18n";
import KitIcon from "@/components/kit/KitIcon";
import { FIESTA } from "@/components/kit/Patterns";
import { MILESTONES, LIVING, type HSrc } from "@/lib/heritage";

const Src = ({ s }: { s: HSrc }) => (
  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-sm font-semibold text-fiesta-blue underline underline-offset-2">{s.label} ↗</a>
);

/** Home: verified milestones and living heritage. Content in src/lib/heritage.ts, text in dict/heritage.ts. */
export default function Heritage() {
  return (
    <div className="mt-8 grid gap-10 lg:grid-cols-2">
      <div>
        <h3 className="font-serif text-2xl font-bold text-fiesta-navy"><T k="her.time.h" /></h3>
        <ol className="mt-5 space-y-4">
          {MILESTONES.map((m) => (
            <li key={m.id} className="flex gap-4">
              <span className="flex h-12 w-16 shrink-0 items-center justify-center rounded-xl bg-white text-base font-bold text-fiesta-blue shadow-sm ring-1 ring-black/5">{m.year}</span>
              <div className="min-w-0 flex-1 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
                <p className="font-serif text-lg font-bold leading-snug text-fiesta-navy"><T k={`her.t${m.id}`} /></p>
                <p className="mt-1 text-black/75"><T k={`her.d${m.id}`} /></p>
                <p className="mt-1 flex flex-wrap gap-x-4">{m.src.map((s) => <Src key={s.url} s={s} />)}</p>
              </div>
            </li>
          ))}
        </ol>
      </div>
      <div>
        <h3 className="font-serif text-2xl font-bold text-fiesta-navy"><T k="her.living.h" /></h3>
        <ul className="mt-5 space-y-4">
          {LIVING.map((c) => (
            <li key={c.id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <div className="flex items-center gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fiesta-blue/10" aria-hidden><KitIcon name={c.icon} color={FIESTA.blue} className="h-6 w-6" /></span>
                <p className="font-serif text-lg font-bold text-fiesta-navy"><T k={`her.${c.id}.t`} /></p>
              </div>
              <p className="mt-3 text-black/75"><T k={`her.${c.id}.d`} /></p>
              <Src s={c.src} />
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-black/70"><T k="her.note" /></p>
      </div>
    </div>
  );
}
