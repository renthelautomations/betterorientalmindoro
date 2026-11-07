import KitIcon from "@/components/kit/KitIcon";
import { T } from "@/lib/i18n/i18n";
import { getLguDirectory, groupOffices, type Office, type OfficeGroup } from "@/lib/lgu-directory";

const tel = (n: string) => "tel:" + n.replace(/[^\d+]/g, "");
const TITLE: Record<OfficeGroup, { label: string; chip: string }> = {
  kaligtasan: { label: "lgu.dir.safety", chip: "bg-fiesta-red/10 text-fiesta-red" },
  kalusugan: { label: "lgu.dir.health", chip: "bg-fiesta-green/15 text-[#1f6b37]" },
  opisina: { label: "lgu.dir.office", chip: "bg-fiesta-blue/10 text-fiesta-blue" },
};
const pill = "inline-flex min-h-11 items-center gap-1.5 rounded-lg bg-fiesta-navy px-3 text-sm font-semibold text-white hover:bg-fiesta-blue";
const mail = "inline-flex min-h-11 items-center break-all text-sm font-semibold text-fiesta-blue underline underline-offset-2 hover:text-fiesta-navy";

function Row({ o }: { o: Office }) {
  return (
    <li className="grid gap-3 rounded-2xl bg-white p-4 shadow-sm sm:grid-cols-[minmax(0,1fr)_auto] sm:items-start sm:p-5">
      <div className="min-w-0">
        <p className="font-semibold leading-snug">{o.name}</p>
        {o.head && <p className="text-sm text-black/65">{o.head}</p>}
        {o.address && <p className="mt-0.5 flex items-center gap-1 text-xs text-black/60"><KitIcon name="pin" className="h-3.5 w-3.5 shrink-0" />{o.address}</p>}
        {o.email.length > 0 && <div className="mt-1 flex flex-col">{o.email.map((e) => <a key={e} href={`mailto:${e}`} className={mail}>{e}</a>)}</div>}
      </div>
      {o.phone.length > 0 && (
        <div className="flex flex-wrap gap-2 sm:max-w-[16rem] sm:justify-end">
          {o.phone.map((n) => <a key={n} href={tel(n)} className={pill}><KitIcon name="phone" className="h-4 w-4" />{n}</a>)}
        </div>
      )}
    </li>
  );
}

/** Direktoryo ng mga opisina ng isang LGU (office, head, number, email), like the provincial directory. Renders nothing when none is published. */
export default function LguDirectory({ slug, name, collapsible = false }: { slug: string; name: string; collapsible?: boolean }) {
  const dir = getLguDirectory(slug);
  if (!dir || !dir.offices.length) return null;
  const g = groupOffices(dir.offices);
  const body = (
    <section aria-label={name} className="space-y-8">
      {(Object.keys(TITLE) as OfficeGroup[]).filter((k) => g[k].length).map((k) => (
        <div key={k}>
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold tracking-widest text-black/65">
            <span className={`rounded-full px-2.5 py-1 text-xs ${TITLE[k].chip}`}>{g[k].length}</span><span className="uppercase"><T k={TITLE[k].label} /></span>
          </h3>
          <ul className="grid gap-3 lg:grid-cols-2">{g[k].map((o) => <Row key={o.name} o={o} />)}</ul>
        </div>
      ))}
      <p className="flex flex-wrap items-center gap-x-4 text-xs text-black/65">
        <a href={dir.source} rel="noopener" className="inline-flex min-h-11 items-center underline"><T k="common.source" /></a>
        <span><T k="common.checked" /> {dir.verifiedAt}</span>
        <span><T k="lgu.dir.note" /></span>
      </p>
    </section>
  );
  if (!collapsible) return body;
  return (
    <details className="rounded-2xl bg-white p-4 shadow-sm">
      <summary className="min-h-11 cursor-pointer font-semibold"><T k="lgu.dir.title" /> ({dir.offices.length})</summary>
      <div className="mt-4">{body}</div>
    </details>
  );
}
