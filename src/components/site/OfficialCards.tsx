import { T } from "@/lib/i18n/i18n";
import KitIcon from "@/components/kit/KitIcon";
import { PatternFill, FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import { OFFICIALS_SOURCE, type Official, type Role } from "@/lib/officials";

const TONE: Partial<Record<Role, string>> = { governor: FIESTA.blue, "vice-governor": FIESTA_DEEP.green, mayor: FIESTA.blue, "vice-mayor": FIESTA_DEEP.green };

/** Head of an office: coloured banner, name, role, party. Party as published, never judged. */
export const Lead = ({ o }: { o: Official }) => (
  <li className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
    <div className="relative isolate h-14" style={{ background: TONE[o.role] ?? FIESTA.navy }}><PatternFill variant="wave" colors={["#fff"]} opacity={0.18} /></div>
    <div className="p-5">
      <p className="text-xs font-semibold tracking-widest text-black/65"><T k={`off.role.${o.role}`} /></p>
      <p className="mt-1 font-serif text-xl font-bold leading-snug text-fiesta-navy">{o.name}</p>
      {o.party && <p className="mt-1 text-sm text-black/70">{o.party}</p>}
    </div>
  </li>
);

export const Person = ({ o }: { o: Official }) => (
  <li className="flex items-center gap-3 rounded-2xl bg-white p-4 shadow-sm ring-1 ring-black/5">
    <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-fiesta-blue/10" aria-hidden><KitIcon name="people" color={FIESTA.blue} className="h-6 w-6" /></span>
    <div className="min-w-0"><p className="font-semibold leading-snug text-fiesta-navy">{o.name}</p>{o.party && <p className="text-sm text-black/70">{o.party}</p>}</div>
  </li>
);

export const Group = ({ id, title, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section aria-labelledby={id}><h2 id={id} className="font-serif text-2xl font-bold text-fiesta-navy"><T k={title} /></h2>{children}</section>
);

export const OfficialsSource = () => (
  <p className="text-xs text-black/70"><T k="off.src" /> <a href={OFFICIALS_SOURCE.sourceUrl} className="font-semibold text-fiesta-blue underline underline-offset-2">data.bettergov.ph</a> · <T k="off.src.note" /></p>
);
