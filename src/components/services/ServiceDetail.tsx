import type { ReactNode } from "react";
import type { Service } from "@/lib/services";
import DraftBadge from "./DraftBadge";

const ASK = "Alamin sa opisina";
const Fact = ({ label, children }: { label: string; children?: ReactNode }) => (
  <div>
    <dt className="text-xs font-semibold tracking-widest text-black/60">{label}</dt>
    <dd className="mt-1">{children ?? <span className="text-black/50">{ASK}</span>}</dd>
  </div>
);
const H = ({ children }: { children: ReactNode }) => <h2 className="mt-8 text-sm font-semibold tracking-widest text-black/60">{children}</h2>;

export default function ServiceDetail({ s }: { s: Service }) {
  return (
    <article>
      <DraftBadge />
      <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">{s.title}</h1>
      <p className="mt-2 text-black/70">{s.summary}</p>
      <dl className="mt-6 grid gap-4 rounded-xl border border-black/10 bg-white p-4 sm:grid-cols-2">
        <Fact label="BAYAD">{s.fee}</Fact>
        <Fact label="TAGAL NG PROSESO">{s.processing}</Fact>
        <Fact label="SINO ANG PUWEDE">{s.who}</Fact>
        <Fact label="OPISINA">{s.office}</Fact>
        <Fact label="ORAS">{s.hours}</Fact>
        {s.contact && <Fact label="CONTACT">{s.contact}</Fact>}
      </dl>
      {s.requirements && (
        <>
          <H>MGA KAILANGAN</H>
          <ul className="mt-3 list-disc space-y-1 pl-5">{s.requirements.map((r) => <li key={r}>{r}</li>)}</ul>
        </>
      )}
      <H>MGA HAKBANG</H>
      {s.steps ? (
        <ol className="mt-3 list-decimal space-y-2 pl-5">{s.steps.map((r) => <li key={r}>{r}</li>)}</ol>
      ) : (
        <p className="mt-3 text-black/70">{ASK}. Walang nakumpirmang hakbang; basahin ang opisyal na pahina sa ibaba.</p>
      )}
      {s.notes && <ul className="mt-4 space-y-1 text-sm text-black/70">{s.notes.map((n) => <li key={n}>{n}</li>)}</ul>}
      <p className="mt-10 rounded-xl bg-black/[0.04] p-4 text-sm text-black/70">
        <a href={s.source} rel="noopener" className="font-semibold underline">Opisyal na source</a> · huling tiningnan {s.checkedAt}
        {s.sourceNote && <> · {s.sourceNote}</>}. Maaaring nagbago na ang detalye; kumpirmahin sa opisina bago pumunta.
      </p>
    </article>
  );
}
