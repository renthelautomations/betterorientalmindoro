import type { ReactNode } from "react";
import type { Service } from "@/lib/services";
import { Accordion, Checklist, Stepper } from "@/components/kit/Ui";
import { Badge } from "@/components/kit/Parts";

const ASK = "Alamin sa opisina";
const Fact = ({ label, children }: { label: string; children?: ReactNode }) => (
  <div>
    <dt className="text-xs font-semibold tracking-widest text-black/65">{label}</dt>
    <dd className="mt-1 text-sm font-medium">{children ?? <span className="font-normal text-black/65">{ASK}</span>}</dd>
  </div>
);

export default function ServiceDetail({ s }: { s: Service }) {
  return (
    <article>
      <Badge kind="wip">Draft: para sa review ng volunteers</Badge>
      <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">{s.title}</h1>
      <p className="mt-2 max-w-2xl text-black/75">{s.summary}</p>
      <dl className="mt-6 grid gap-4 rounded-2xl border border-black/10 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
        <Fact label="BAYAD">{s.fee}</Fact>
        <Fact label="TAGAL NG PROSESO">{s.processing}</Fact>
        <Fact label="SINO ANG PUWEDE">{s.who}</Fact>
        <Fact label="OPISINA">{s.office}</Fact>
        <Fact label="ORAS">{s.hours}</Fact>
        {s.contact && <Fact label="CONTACT">{s.contact}</Fact>}
      </dl>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="hakbang">
          <h2 id="hakbang" className="mb-4 font-serif text-xl font-bold">Mga hakbang</h2>
          {s.steps ? <Stepper steps={s.steps.map((t) => ({ title: t, body: "" }))} /> : <p className="text-sm text-black/70">{ASK}. Walang nakumpirmang hakbang; basahin ang opisyal na pahina sa ibaba.</p>}
        </section>
        <section aria-labelledby="kailangan">
          <h2 id="kailangan" className="mb-4 font-serif text-xl font-bold">Mga kailangan</h2>
          {s.requirements ? <Checklist title="CHECKLIST" items={s.requirements} /> : <p className="text-sm text-black/70">{ASK}.</p>}
        </section>
      </div>
      {s.notes && (
        <div className="mt-8">
          <Accordion items={[{ q: "Mga tala", a: <ul className="list-disc space-y-1 pl-5">{s.notes.map((n) => <li key={n}>{n}</li>)}</ul> }]} />
        </div>
      )}
      <p className="mt-10 rounded-2xl bg-fiesta-mint/60 p-4 text-sm text-black/75">
        <a href={s.source} rel="noopener" className="font-semibold underline">Opisyal na source</a> · huling tiningnan {s.checkedAt}
        {s.sourceNote && <> · {s.sourceNote}</>}. Maaaring nagbago na ang detalye; kumpirmahin sa opisina bago pumunta.
      </p>
    </article>
  );
}
