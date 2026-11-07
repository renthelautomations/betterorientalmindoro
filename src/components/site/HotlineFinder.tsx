"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import HotlineTile from "./HotlineTile";
import { useT } from "@/lib/i18n/i18n";
import Dropdown from "./Dropdown";
import { OFFICES, QUICK, officeOf, searchHotlines, type Category, type Hotline, type Office } from "@/lib/hotlines";

const CATS: Category[] = ["emergency", "medical", "government", "utility"];

/** Smart search, suggestions and three dropdown filters (place, type, office). Results group by type. The place defaults to the whole province, as before. */
export default function HotlineFinder({ rows, towns, initialTown, extras }: { rows: Hotline[]; towns: { slug: string; name: string }[]; initialTown?: string; extras?: Record<string, React.ReactNode> }) {
  const t = useT();
  const [q, setQ] = useState("");
  const [place, setPlace] = useState(initialTown ?? "province");
  const [cat, setCat] = useState("");
  const [office, setOffice] = useState("");
  const [open, setOpen] = useState(false);
  const box = useRef<HTMLDivElement>(null);
  const nameOf = useMemo(() => Object.fromEntries(towns.map((x) => [x.slug, x.name])), [towns]);
  const where = (scope: string) => (scope === "province" ? t("dyn.province") : nameOf[scope] ?? scope);

  useEffect(() => {
    const u = new URL(location.href);
    if (place === "province") u.searchParams.delete("bayan"); else u.searchParams.set("bayan", place);
    history.replaceState(null, "", u);
  }, [place]);
  useEffect(() => {
    const down = (e: MouseEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("mousedown", down);
    return () => document.removeEventListener("mousedown", down);
  }, []);

  const searching = q.trim().length > 0;
  const matches = useMemo(() => (searching ? searchHotlines(rows, q, (s) => (s === "province" ? "lalawigan province" : nameOf[s] ?? s)) : null), [rows, q, searching, nameOf]);
  // With a search typed and the default place, look everywhere; an explicitly chosen town narrows it.
  const pool = matches ?? rows.filter((h) => h.scope === place || h.scope === "province");
  const shown = pool.filter((h) => (!searching ? true : place === "province" || h.scope === place || h.scope === "province") && (!cat || h.category === cat) && (!office || officeOf(h.name) === office));
  const localCount = !searching && place !== "province" ? shown.filter((h) => h.scope === place).length : 0;
  const suggestions = searching ? (matches ?? []).slice(0, 5) : [];
  const offices = OFFICES.filter((o) => rows.some((h) => officeOf(h.name) === o));
  const active = searching || cat || office || place !== "province";
  const reset = () => { setQ(""); setCat(""); setOffice(""); setPlace("province"); };

  const groups = CATS.map((c) => ({ c, list: shown.filter((h) => h.category === c) })).filter((g) => g.list.length);
  const label = (txt: string, id: string) => <label htmlFor={id} className="mb-1 block text-xs font-semibold uppercase tracking-widest text-black/60">{txt}</label>;

  return (
    <div>
      <div ref={box} className="relative max-w-2xl">
        <label htmlFor="hot-q" className="sr-only">{t("hot.search")}</label>
        <input id="hot-q" type="search" value={q} autoComplete="off" onChange={(e) => { setQ(e.target.value); setOpen(true); }} onFocus={() => setOpen(true)} placeholder={t("hot.search.ph")}
          className="min-h-12 w-full rounded-full border-2 border-fiesta-navy/20 bg-white px-5 text-base outline-none focus:border-fiesta-blue focus:ring-4 focus:ring-fiesta-blue/20" />
        {open && searching && suggestions.length > 0 && (
          <ul className="absolute z-20 mt-2 w-full overflow-hidden rounded-2xl bg-white shadow-xl ring-1 ring-black/10">
            {suggestions.map((h) => (
              <li key={h.id}>
                <button type="button" onClick={() => { setQ(h.name); setOpen(false); }} className="flex min-h-12 w-full items-center gap-3 px-4 py-2 text-left hover:bg-fiesta-mint">
                  <span className="min-w-0 flex-1"><span className="block truncate font-medium">{h.name}</span><span className="block truncate text-xs text-black/60">{where(h.scope)} · {t(`hot.off.${officeOf(h.name)}`)}</span></span>
                  <span className="shrink-0 text-sm font-semibold tabular-nums text-fiesta-navy">{h.number}</span>
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>
      {!searching && (
        <p className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <span className="text-black/65">{t("hot.try")}</span>
          {QUICK.map(([k, term]) => <button key={k} type="button" onClick={() => setQ(term)} className="min-h-9 rounded-full border-2 border-fiesta-navy/20 bg-white px-3 text-sm font-semibold text-fiesta-navy hover:border-fiesta-navy">{t(k)}</button>)}
        </p>
      )}

      <div className="mt-5 grid gap-3 sm:grid-cols-3">
        <div>{label(t("hot.f.place"), "hot-place")}
          <Dropdown id="hot-place" value={place} onChange={setPlace} options={[{ v: "province", t: t("dyn.province") }, ...towns.map((x) => ({ v: x.slug, t: x.name }))]} /></div>
        <div>{label(t("hot.f.type"), "hot-cat")}
          <Dropdown id="hot-cat" value={cat} onChange={setCat} options={[{ v: "", t: t("hot.f.any") }, ...CATS.map((c) => ({ v: c, t: t(`cat.${c}`) }))]} /></div>
        <div>{label(t("hot.f.office"), "hot-office")}
          <Dropdown id="hot-office" value={office} onChange={setOffice} options={[{ v: "", t: t("hot.f.any") }, ...offices.map((o: Office) => ({ v: o, t: t(`hot.off.${o}`) }))]} /></div>
      </div>

      <div className="mt-4 flex flex-wrap items-center gap-3 text-sm" aria-live="polite">
        <span className="text-black/70">{shown.length} {t("hot.found")}</span>
        {active && <button type="button" onClick={reset} className="min-h-9 font-semibold text-fiesta-blue underline">{t("hot.reset")}</button>}
      </div>

      {!searching && !cat && !office && extras?.[place] && <div className="mt-6">{extras[place]}</div>}

      {place !== "province" && !searching && localCount === 0 && (
        <p className="mt-4 rounded-2xl bg-fiesta-mint p-4 text-sm">{t("dyn.hotline.none")} <b>{nameOf[place]}</b>. {t("dyn.hotline.none.p")}</p>
      )}
      {groups.length ? (
        <div className="mt-6 space-y-8">
          {groups.map(({ c, list }) => (
            <section key={c} aria-label={t(`cat.${c}`)}>
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-widest text-black/65">{t(`cat.${c}`)}</h3>
              <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {list.map((h) => (
                  <li key={h.id} className="h-full"><HotlineTile h={h} tone={c} where={where(h.scope)} /></li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      ) : (
        <p className="mt-6 rounded-2xl bg-black/5 p-6 text-sm text-black/70">{t("hot.none")}</p>
      )}
    </div>
  );
}
