"use client";
import { useT } from "@/lib/i18n/i18n";
import { DISCLAIMER as DISCLAIMER_EN, REPORT_MISTAKE_URL, VERIFY_KEY, flagVars, type DocFlag } from "@/lib/gov-doc-flags";
import { FlagSvg } from "./GovDocBits";

/** One automatic check, shown calmly. Plain presentational: pass a flag object (also used for procurement flags). Title and sentence are English as generated; Filipino comes from gova.flag.<rule>.title/.what when that key exists. */
export default function GovFlagCard({ flag }: { flag: DocFlag }) {
  const t = useT();
  const v = flagVars(flag);
  const fill = (s: string) => s.replace(/\{(\d)\}/g, (_, i) => v[+i] ?? "");
  const tr = (k: string, fallback: string) => { const s = t(k); return s === k ? fallback : fill(s); };
  const review = flag.severity === "review";
  const id = `flag-${flag.id.replace(/[^a-z0-9]+/gi, "-")}`;
  return (
    <article aria-labelledby={id} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
      <div className="flex items-start gap-3">
        <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${review ? "bg-[#fdf0d5] text-[#7a4a00]" : "bg-black/5 text-black/65"}`}><FlagSvg className="h-5 w-5" /></span>
        <div className="min-w-0 flex-1">
          <p className="text-xs font-semibold tracking-widest text-black/65 uppercase">{t(review ? "gova.flag.review" : "gova.flag.info")}</p>
          <h3 id={id} className="mt-0.5 font-serif text-lg font-bold leading-snug text-fiesta-navy">{tr(`gova.flag.${flag.rule}.title`, flag.title)}</h3>
          <p className="mt-1 text-sm text-black/75">{tr(`gova.flag.${flag.rule}.what`, flag.what)}</p>
        </div>
      </div>
      <details className="group mt-3">
        <summary className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-fiesta-navy/5 px-4 text-sm font-semibold text-fiesta-navy hover:bg-fiesta-navy/10 focus-visible:outline-2 focus-visible:outline-fiesta-blue">{t("gova.flag.more")}</summary>
        <div className="mt-3 space-y-4 text-sm text-black/80">
          <section>
            <h4 className="font-bold text-fiesta-navy">{t("gova.flag.evidence")}</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5">
              {flag.evidence.map((e, i) => <li key={i}><span className="font-mono text-xs">{e.docId}</span>{e.page != null && <> · {t("gova.page")} {e.page}</>}{e.value && <> · {e.value}</>}{e.quote && <> · <q>{e.quote}</q></>}</li>)}
            </ul>
          </section>
          <section>
            <h4 className="font-bold text-fiesta-navy">{t("gova.flag.verify")}</h4>
            <ul className="mt-1 list-disc space-y-1 pl-5">{flag.verify.map((s) => <li key={s}>{t(VERIFY_KEY[s] ?? s)}</li>)}</ul>
          </section>
          {flag.references.length > 0 && (
            <section>
              <h4 className="font-bold text-fiesta-navy">{t("gova.flag.refs")}</h4>
              <ul className="mt-1 list-disc space-y-1 pl-5">{flag.references.map((r) => <li key={r.url}><a href={r.url} rel="noopener" target="_blank" className="text-fiesta-blue underline">{r.label}</a></li>)}</ul>
            </section>
          )}
        </div>
      </details>
      <p className="mt-3 text-xs text-black/65">{flag.disclaimer === DISCLAIMER_EN ? t("gova.flag.disclaimer") : flag.disclaimer}</p>
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span className="inline-flex min-h-8 items-center rounded-full bg-fiesta-navy/5 px-3 text-xs font-semibold text-fiesta-navy">{t("gova.flag.conf")}: {t(`gova.conf.${flag.confidence}`)}</span>
        <a href={REPORT_MISTAKE_URL} rel="noopener" target="_blank" className="inline-flex min-h-11 items-center text-sm font-semibold text-fiesta-blue underline">{t("gova.flag.report")}</a>
      </div>
    </article>
  );
}
