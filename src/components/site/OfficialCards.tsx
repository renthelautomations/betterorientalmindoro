import Link from "next/link";
import { T } from "@/lib/i18n/i18n";
import { PatternFill, FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import { OFFICIALS_SOURCE, PARTY, sameSurname, type Official, type Role } from "@/lib/officials";
import { getMunicipalities } from "@/lib/municipalities";
import { fmtInt, fmtPct } from "@/lib/stats";
import { TF } from "./DynBits";

const TONE: Partial<Record<Role, string>> = { governor: FIESTA.blue, "vice-governor": FIESTA_DEEP.green, mayor: FIESTA.blue, "vice-mayor": FIESTA_DEEP.green };
// Fixed colour per party code, only to tell chips apart. The colours carry no meaning.
const PARTY_COLOR: Record<string, string> = { LAKAS: FIESTA.red, GSM: FIESTA.orange, MBS: FIESTA.blue, PFP: FIESTA.navy, LP: FIESTA.yellow, IND: "#6b7280", LDP: FIESTA.green, AKSYON: FIESTA.sky };
const townName = (slug: string | null) => (slug ? getMunicipalities().find((m) => m.slug === slug)?.name ?? slug : null);
const initials = (n: string) => n.replace(/^(Hon\.|Atty\.|Dr\.|Engr\.)\s*/i, "").split(/\s+/).filter(Boolean).map((w, i, a) => (i === 0 || i === a.length - 1 ? w[0] : "")).join("").toUpperCase();
const CYCLE = [FIESTA.orange, FIESTA.blue, FIESTA_DEEP.green, FIESTA.red, FIESTA.navy, FIESTA_DEEP.sky];
const pick = (n: string) => CYCLE[[...n].reduce((a, c) => (a * 31 + c.charCodeAt(0)) >>> 0, 7) % CYCLE.length];
/** Initials in a brand-colour circle, colour from the name so it stays the same on every page. */
export const Avatar = ({ name, color, className = "h-11 w-11 text-sm" }: { name: string; color?: string; className?: string }) => (
  <span className={`relative z-10 flex shrink-0 items-center justify-center rounded-full font-serif font-bold text-white shadow-sm ${className}`} style={{ background: color ?? pick(name) }} aria-hidden>{initials(name)}</span>
);
const title = (n: string) => n.replace(/\b(\w)(\w*)/g, (_, a, b) => a + b.toLowerCase());

const PartyChip = ({ code, on = false }: { code: string | null; on?: boolean }) => {
  if (!code) return null;
  const c = PARTY_COLOR[code] ?? FIESTA.navy, dark = c === FIESTA.yellow;
  return <abbr title={PARTY[code] ?? code} className="no-underline"><span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold tracking-wide" style={on ? { background: "rgba(255,255,255,.92)", color: FIESTA.navy } : { background: c, color: dark ? FIESTA.navy : "#fff" }}>{code}</span></abbr>;
};

const Stat = ({ label, children, className = "" }: { label: string; children: React.ReactNode; className?: string }) => (
  <div className={`min-w-0 rounded-2xl bg-fiesta-cream px-3 py-2.5 ${className}`}><p className="text-[11px] font-semibold uppercase tracking-widest text-black/60"><T k={label} /></p><div className="mt-0.5">{children}</div></div>
);
const Pips = ({ n, max = 3 }: { n: number; max?: number }) => (
  <span className="inline-flex items-center gap-1" aria-hidden>{Array.from({ length: Math.max(max, n) }, (_, i) => <span key={i} className="h-2.5 w-2.5 rounded-full" style={{ background: i < n ? FIESTA.orange : "rgba(27,42,74,.15)" }} />)}</span>
);

/** Votes, vote share or rank, and how many terms in a row. */
const Stats = ({ o, compact = false }: { o: Official; compact?: boolean }) => (
  <div className={`mt-4 grid grid-cols-2 gap-2 sm:grid-cols-3 ${compact ? "[&_p.font-serif]:!text-base" : ""}`}>
    <Stat label="off.k.votes"><p className="font-serif text-lg font-bold leading-tight text-fiesta-navy tabular-nums">{o.votes != null ? fmtInt(o.votes) : "-"}</p></Stat>
    {o.rank ? <Stat label="off.k.rank"><p className="font-serif text-lg font-bold leading-tight text-fiesta-navy tabular-nums">{o.rank}<span className="text-sm font-normal text-black/60"> <TF k="off.rankof" v={[o.of ?? ""]} /></span></p></Stat>
      : <Stat label="off.k.share"><p className="font-serif text-lg font-bold leading-tight text-fiesta-navy tabular-nums">{o.share != null ? fmtPct(o.share) : "-"}</p>
        {o.share != null && <span className="mt-1 block h-1.5 overflow-hidden rounded-full bg-black/10" aria-hidden><span className="block h-full rounded-full bg-fiesta-blue" style={{ width: `${Math.round(o.share * 100)}%` }} /></span>}</Stat>}
    <Stat label="off.k.term" className="col-span-2 sm:col-span-1"><p className="flex items-center gap-2 font-serif text-lg font-bold leading-tight text-fiesta-navy"><span className="tabular-nums">{o.streak}</span><Pips n={o.streak} /></p></Stat>
  </div>
);

/** Winner against the runner-up, bars to scale. */
const Margin = ({ o }: { o: Official }) => {
  if (o.votes == null || o.share == null) return null;
  const ru = o.runnerUp;
  if (!ru) return <p className="mt-3 text-sm text-black/70"><T k="off.alone" /></p>;
  const w = (v: number) => `${Math.max((v / o.votes!) * 100, 4)}%`;
  return (
    <div className="mt-3 space-y-1.5">
      <p className="text-sm font-semibold text-fiesta-navy"><TF k="off.margin" v={[fmtInt(o.votes - ru.votes)]} /></p>
      {[{ n: title(o.name), v: o.votes, c: FIESTA.blue }, { n: `${title(ru.name.split(", ").reverse().join(" "))}${ru.party ? ` (${ru.party})` : ""}`, v: ru.votes, c: "rgba(27,42,74,.35)" }].map((r) => (
        <div key={r.n} className="text-xs text-black/75"><div className="flex justify-between gap-2"><span className="truncate">{r.n}</span><span className="tabular-nums">{fmtInt(r.v)}</span></div><span className="mt-0.5 block h-2 overflow-hidden rounded-full bg-black/5" aria-hidden><span className="block h-full rounded-full" style={{ width: w(r.v), background: r.c }} /></span></div>
      ))}
    </div>
  );
};

/** Earlier offices as small chips. */
const Earlier = ({ o }: { o: Official }) => !o.earlier.length ? null : (
  <div className="mt-3"><p className="text-[11px] font-semibold uppercase tracking-widest text-black/60"><T k="off.before" /></p>
    <ul className="mt-1.5 flex flex-wrap gap-1.5">
      {o.earlier.slice(0, 4).map((e, i) => <li key={i} className="rounded-full bg-fiesta-mint px-2.5 py-1 text-xs font-medium text-fiesta-navy"><T k={`off.role.${e.role}`} />{e.town ? ` · ${townName(e.town)}` : ""} · {e.years.length > 2 ? `${e.years[0]}–${e.years.at(-1)}` : e.years.join(", ")}</li>)}
    </ul></div>
);

/** Shared surname, folded away so the card stays short. */
const Surname = ({ o }: { o: Official }) => {
  const same = sameSurname(o);
  if (!same.length) return null;
  return (
    <details className="group mt-3 rounded-xl bg-fiesta-cream px-3 py-2 text-sm">
      <summary className="cursor-pointer list-none font-semibold text-fiesta-navy marker:hidden [&::-webkit-details-marker]:hidden"><span className="mr-1 inline-block transition group-open:rotate-90" aria-hidden>›</span><TF k="off.surname.s" v={[same.length]} /></summary>
      <p className="mt-2 text-black/75"><TF k="off.surname.body" v={[same.slice(0, 4).map((x) => `${x.name.split(" ").slice(-2).join(" ")} (${x.town ? townName(x.town) : "province"})`).join(", ")]} /> <Link href="/dynasties" className="font-semibold text-fiesta-blue underline underline-offset-2"><T k="off.surname.link" /></Link></p>
    </details>
  );
};

/** Head of an office: banner with role and party, avatar, name, then the numbers. */
export const Lead = ({ o }: { o: Official }) => (
  <li className="flex flex-col overflow-hidden rounded-3xl bg-white shadow-sm ring-1 ring-black/5">
    <div className="relative isolate flex items-center justify-between px-5 pb-8 pt-4" style={{ background: TONE[o.role] ?? FIESTA.navy }}>
      <PatternFill variant="wave" colors={["#fff"]} opacity={0.18} />
      <p className="relative text-xs font-bold uppercase tracking-widest text-white"><T k={`off.role.${o.role}`} /></p>
      <span className="relative"><PartyChip code={o.party} on /></span>
    </div>
    <div className="-mt-7 flex flex-1 flex-col px-5 pb-5">
      <span className="relative z-10 flex h-14 w-14 items-center justify-center rounded-full border-4 border-white font-serif text-lg font-bold text-white shadow-sm" style={{ background: PARTY_COLOR[o.party ?? ""] ?? FIESTA.navy, color: o.party === "LP" ? FIESTA.navy : "#fff" }} aria-hidden>{initials(o.name)}</span>
      <p className="mt-2 font-serif text-2xl font-bold leading-snug text-fiesta-navy">{o.name}</p>
      {o.party && PARTY[o.party] && <p className="text-sm text-black/65">{PARTY[o.party]}</p>}
      <Stats o={o} /><Margin o={o} /><Earlier o={o} /><Surname o={o} />
    </div>
  </li>
);

export const Person = ({ o }: { o: Official }) => (
  <li className="flex flex-col rounded-3xl bg-white p-4 shadow-sm ring-1 ring-black/5">
    <div className="flex items-start gap-3">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full font-serif text-sm font-bold" style={{ background: PARTY_COLOR[o.party ?? ""] ?? FIESTA.navy, color: o.party === "LP" ? FIESTA.navy : "#fff" }} aria-hidden>{initials(o.name)}</span>
      <div className="min-w-0 flex-1"><p className="font-semibold leading-snug text-fiesta-navy">{o.name}</p><div className="mt-1"><PartyChip code={o.party} /></div></div>
    </div>
    <Stats o={o} compact /><Earlier o={o} /><Surname o={o} />
  </li>
);

export const Group = ({ id, title: t, children }: { id: string; title: string; children: React.ReactNode }) => (
  <section aria-labelledby={id}><h2 id={id} className="font-serif text-2xl font-bold text-fiesta-navy"><T k={t} /></h2>{children}</section>
);

export const OfficialsSource = () => (
  <p className="text-xs text-black/70"><T k="off.src" /> <a href={OFFICIALS_SOURCE.sourceUrl} className="font-semibold text-fiesta-blue underline underline-offset-2">data.bettergov.ph</a> · <T k="off.src.note" /> <T k="off.party.note" /></p>
);
