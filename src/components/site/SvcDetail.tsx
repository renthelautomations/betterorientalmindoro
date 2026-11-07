import type { ReactNode } from "react";
import type { Service } from "@/lib/services";
import { getCategory, getServices } from "@/lib/services";
import { T } from "@/lib/i18n/i18n";
import KitIcon from "@/components/kit/KitIcon";
import { Badge } from "@/components/kit/Parts";
import { CATEGORY_ICON, PatternStrip, lookOf } from "@/components/site/ServiceTile";
import { ServiceLink } from "@/components/site/ServiceLink";

const CARD = "rounded-2xl bg-white p-6 shadow-sm ring-1 ring-black/5";

const Fact = ({ label, children }: { label: string; children?: ReactNode }) => (
  <div>
    <dt className="text-xs font-semibold tracking-widest text-black/65"><T k={label} /></dt>
    <dd className="mt-1 text-sm font-medium">{children ?? <span className="font-normal text-black/65"><T k="dyn.serbisyo.ask" /></span>}</dd>
  </div>
);

const Head = ({ id, icon, color, k }: { id: string; icon: "check" | "calendar" | "pin" | "doc" | "budget"; color: string; k: string }) => (
  <h2 id={id} className="mb-4 flex items-center gap-3 font-serif text-xl font-bold">
    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full" style={{ background: color }}><KitIcon name={icon} color="#fff" className="h-5 w-5" /></span><T k={k} />
  </h2>
);

export default function SvcDetail({ s }: { s: Service }) {
  const look = lookOf(s.category);
  const cat = getCategory(s.category);
  const related = getServices(s.category).filter((r) => r.id !== s.id).slice(0, 4);
  return (
    <article className="space-y-5">
      <div className="overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
        <PatternStrip slug={s.category} />
        <div className="p-6 pt-0">
          <span className="relative z-10 -mt-8 flex h-16 w-16 items-center justify-center rounded-full ring-4 ring-white" style={{ background: look.color }}><KitIcon name={CATEGORY_ICON[s.category] ?? "doc"} color="#fff" className="h-8 w-8" /></span>
          <div className="mt-3 flex flex-wrap items-center gap-2">
            {cat && <span className="text-xs font-semibold tracking-widest text-black/65"><T k={`svc.cat.${s.category}`} /></span>}
            <Badge kind="wip"><T k="dyn.serbisyo.draft" /></Badge>
          </div>
          <h1 className="mt-2 font-serif text-3xl font-bold md:text-4xl">{s.title}</h1>
          <p className="mt-2 max-w-2xl text-black/75">{s.summary}</p>
          <a href={s.source} rel="noopener" className="mt-5 inline-flex min-h-11 items-center gap-2 rounded-full px-6 font-semibold text-white transition hover:brightness-110 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue" style={{ background: look.color }}>
            <T k="uxa.svc.open" /><KitIcon name="arrow" color="#fff" className="h-5 w-5" />
          </a>
        </div>
      </div>

      <section aria-labelledby="bayad" className={CARD}>
        <Head id="bayad" icon="budget" color={look.color} k="uxa.svc.details" />
        <dl className="grid gap-4 sm:grid-cols-3">
          <Fact label="dyn.serbisyo.fee">{s.fee}</Fact>
          <Fact label="dyn.serbisyo.processing">{s.processing}</Fact>
          <Fact label="dyn.serbisyo.who">{s.who}</Fact>
        </dl>
      </section>

      <section aria-labelledby="kailangan" className={CARD}>
        <Head id="kailangan" icon="doc" color={look.color} k="dyn.serbisyo.reqs" />
        {s.requirements ? (
          <ul className="space-y-2">{s.requirements.map((r) => <li key={r} className="flex gap-3 text-sm"><KitIcon name="check" className="mt-0.5 h-5 w-5 shrink-0 text-fiesta-green" />{r}</li>)}</ul>
        ) : <p className="text-sm text-black/70"><T k="dyn.serbisyo.ask" />.</p>}
      </section>

      <section aria-labelledby="hakbang" className={CARD}>
        <Head id="hakbang" icon="check" color={look.color} k="dyn.serbisyo.steps" />
        {s.steps ? (
          <ol>
            {s.steps.map((t, i) => (
              <li key={t} className="relative flex gap-4 pb-6 last:pb-0">
                {i < s.steps!.length - 1 && <span className="absolute left-[19px] top-10 h-[calc(100%-2.5rem)] w-0.5 bg-black/10" aria-hidden />}
                <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full font-serif text-lg font-bold text-white" style={{ background: look.color }}>{i + 1}</span>
                <p className="pt-2 font-medium">{t}</p>
              </li>
            ))}
          </ol>
        ) : <p className="text-sm text-black/70"><T k="dyn.serbisyo.ask" />. <T k="dyn.serbisyo.nosteps" /></p>}
      </section>

      <section aria-labelledby="saan" className={CARD}>
        <Head id="saan" icon="pin" color={look.color} k="uxa.svc.where" />
        <dl className="grid gap-4 sm:grid-cols-3">
          <Fact label="dyn.serbisyo.office">{s.office}</Fact>
          <Fact label="dyn.serbisyo.hours">{s.hours}</Fact>
          {s.contact && <Fact label="dyn.serbisyo.contact">{s.contact}</Fact>}
        </dl>
      </section>

      {s.notes && (
        <section aria-labelledby="tala" className={CARD}>
          <Head id="tala" icon="calendar" color={look.color} k="dyn.serbisyo.notes" />
          <ul className="list-disc space-y-1 pl-5 text-sm text-black/80">{s.notes.map((n) => <li key={n}>{n}</li>)}</ul>
        </section>
      )}

      <section aria-labelledby="pinagmulan" className="rounded-2xl bg-fiesta-mint/60 p-6 text-sm text-black/80">
        <h2 id="pinagmulan" className="mb-2 font-serif text-xl font-bold text-black"><T k="uxa.svc.source" /></h2>
        <a href={s.source} rel="noopener" className="font-semibold underline"><T k="dyn.serbisyo.source" /></a> · <T k="dyn.serbisyo.checked" /> {s.checkedAt}
        {s.sourceNote && <> · {s.sourceNote}</>}. <T k="dyn.serbisyo.confirm" />
      </section>

      {related.length > 0 && (
        <section aria-labelledby="kaugnay" className="pt-3">
          <h2 id="kaugnay" className="mb-4 font-serif text-xl font-bold"><T k="uxa.svc.related" /></h2>
          <div className="grid gap-3 sm:grid-cols-2">{related.map((r) => <ServiceLink key={r.id} s={r} />)}</div>
        </section>
      )}
    </article>
  );
}
