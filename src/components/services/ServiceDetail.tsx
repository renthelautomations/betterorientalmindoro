import type { ReactNode } from "react";
import type { Service } from "@/lib/services";
import { Stepper } from "@/components/kit/Ui";
import { T } from "@/lib/i18n/i18n";
import { TAccordion, TChecklist } from "@/components/site/DynBits";
import { Badge } from "@/components/kit/Parts";

const Fact = ({ label, children }: { label: string; children?: ReactNode }) => (
  <div>
    <dt className="text-xs font-semibold tracking-widest text-black/65"><T k={label} /></dt>
    <dd className="mt-1 text-sm font-medium">{children ?? <span className="font-normal text-black/65"><T k="dyn.serbisyo.ask" /></span>}</dd>
  </div>
);

export default function ServiceDetail({ s }: { s: Service }) {
  return (
    <article>
      <Badge kind="wip"><T k="dyn.serbisyo.draft" /></Badge>
      <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">{s.title}</h1>
      <p className="mt-2 max-w-2xl text-black/75">{s.summary}</p>
      <dl className="mt-6 grid gap-4 rounded-2xl border border-black/10 bg-white p-5 sm:grid-cols-2 lg:grid-cols-3">
        <Fact label="dyn.serbisyo.fee">{s.fee}</Fact>
        <Fact label="dyn.serbisyo.processing">{s.processing}</Fact>
        <Fact label="dyn.serbisyo.who">{s.who}</Fact>
        <Fact label="dyn.serbisyo.office">{s.office}</Fact>
        <Fact label="dyn.serbisyo.hours">{s.hours}</Fact>
        {s.contact && <Fact label="dyn.serbisyo.contact">{s.contact}</Fact>}
      </dl>
      <div className="mt-8 grid gap-8 lg:grid-cols-2">
        <section aria-labelledby="hakbang">
          <h2 id="hakbang" className="mb-4 font-serif text-xl font-bold"><T k="dyn.serbisyo.steps" /></h2>
          {s.steps ? <Stepper steps={s.steps.map((t) => ({ title: t, body: "" }))} /> : <p className="text-sm text-black/70"><T k="dyn.serbisyo.ask" />. <T k="dyn.serbisyo.nosteps" /></p>}
        </section>
        <section aria-labelledby="kailangan">
          <h2 id="kailangan" className="mb-4 font-serif text-xl font-bold"><T k="dyn.serbisyo.reqs" /></h2>
          {s.requirements ? <TChecklist title="dyn.serbisyo.checklist" items={s.requirements} /> : <p className="text-sm text-black/70"><T k="dyn.serbisyo.ask" />.</p>}
        </section>
      </div>
      {s.notes && (
        <div className="mt-8">
          <TAccordion items={[{ q: "dyn.serbisyo.notes", a: <ul className="list-disc space-y-1 pl-5">{s.notes.map((n) => <li key={n}>{n}</li>)}</ul> }]} />
        </div>
      )}
      <p className="mt-10 rounded-2xl bg-fiesta-mint/60 p-4 text-sm text-black/75">
        <a href={s.source} rel="noopener" className="font-semibold underline"><T k="dyn.serbisyo.source" /></a> · <T k="dyn.serbisyo.checked" /> {s.checkedAt}
        {s.sourceNote && <> · {s.sourceNote}</>}. <T k="dyn.serbisyo.confirm" />
      </p>
    </article>
  );
}
