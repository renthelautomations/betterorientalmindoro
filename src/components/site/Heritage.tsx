import { T } from "@/lib/i18n/i18n";
import { FIESTA } from "@/components/kit/Patterns";
import { MILESTONES, type HSrc } from "@/lib/heritage";
import HeritageArt from "./HeritageArt";

const BADGE = [FIESTA.orange, FIESTA.blue, FIESTA.green, FIESTA.red, FIESTA.navy, FIESTA.yellow];
const Src = ({ s }: { s: HSrc }) => (
  <a href={s.url} target="_blank" rel="noopener noreferrer" className="inline-block py-1 text-sm font-semibold text-fiesta-blue underline underline-offset-2">{s.label} ↗</a>
);

/** Home: verified milestones, newest first, zig-zag around a spine. Content in src/lib/heritage.ts, text in dict/heritage.ts. */
export default function Heritage() {
  return (
    <div className="mt-10">
      <ol className="relative">
        <span aria-hidden className="absolute bottom-0 left-1/2 top-0 hidden w-1 -translate-x-1/2 rounded-full bg-fiesta-navy/15 md:block" />
        {MILESTONES.map((m, i) => {
          const artLeft = i % 2 === 0;
          const art = (
            <div className={`h-52 overflow-hidden rounded-3xl shadow-sm ring-1 ring-black/10 md:h-64 ${artLeft ? "md:order-1" : "md:order-3"}`}><HeritageArt id={m.id} /></div>
          );
          const text = (
            <div className={`flex flex-col justify-center ${artLeft ? "md:order-3 md:pl-4" : "md:order-1 md:pr-4 md:text-right"}`}>
              <p className="text-sm font-bold tracking-widest text-black/60 md:hidden">{m.year}</p>
              <h3 className="font-serif text-2xl font-bold leading-snug text-fiesta-navy"><T k={`her.t${m.id}`} /></h3>
              <p className="mt-2 text-black/75"><T k={`her.d${m.id}`} /></p>
              <p className={`mt-1 flex flex-wrap gap-x-4 ${artLeft ? "" : "md:justify-end"}`}>{m.src.map((s) => <Src key={s.url} s={s} />)}</p>
            </div>
          );
          return (
            <li key={m.id} className="grid items-center gap-4 pb-12 last:pb-0 md:grid-cols-[1fr_5rem_1fr] md:gap-0">
              {art}
              <div className="relative z-10 hidden justify-center md:order-2 md:flex">
                <span className="flex h-16 w-16 items-center justify-center rounded-full border-4 border-[#fbf7f0] font-serif text-lg font-bold shadow-sm" style={{ background: BADGE[i % BADGE.length], color: i % BADGE.length === 5 ? FIESTA.navy : "#fff" }}>{m.year}</span>
              </div>
              {text}
            </li>
          );
        })}
      </ol>
      <p className="mt-10 text-sm text-black/70"><T k="her.note" /> <T k="her.credit" /> <a href="https://www.geoboundaries.org" target="_blank" rel="noopener noreferrer" className="font-semibold text-fiesta-blue underline underline-offset-2">geoboundaries.org</a></p>
    </div>
  );
}
