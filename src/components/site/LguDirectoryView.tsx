"use client";
import { useMemo, useState } from "react";
import KitIcon, { type KitIconName } from "@/components/kit/KitIcon";
import { fold } from "@/lib/smart-search";
import OfficeRow from "./OfficeRow";
import { T, useT } from "@/lib/i18n/i18n";
import type { LguDirectory, OfficeGroup } from "@/lib/lgu-directory";

const tel = (n: string) => "tel:" + n.replace(/[^\d+]/g, "");
const GROUPS: { key: OfficeGroup; label: string; icon: KitIconName; color: string; bg: string }[] = [
  { key: "kaligtasan", label: "lgu.dir.safety", icon: "alert", color: "#a8281b", bg: "#fbe9e6" },
  { key: "kalusugan", label: "lgu.dir.health", icon: "health", color: "#1f6b37", bg: "#e2f2e7" },
  { key: "opisina", label: "lgu.dir.office", icon: "shield", color: "#2b4fa3", bg: "#e6ecf8" },
];

/** Clean office list: search, three category pills with counts, then one card of rows (name, head and address, call and email buttons). Offices exactly as the LGU's own site publishes them. */
export default function LguDirectoryView({ dir, name, collapsible }: { dir: LguDirectory; name: string; collapsible: boolean }) {
  const t = useT();
  const [q, setQ] = useState("");
  const [cat, setCat] = useState<OfficeGroup | "all">("all");
  const counts = useMemo(() => Object.fromEntries(GROUPS.map((g) => [g.key, dir.offices.filter((o) => o.category === g.key).length])) as Record<OfficeGroup, number>, [dir]);
  const needle = fold(q.trim());
  const rows = useMemo(() => dir.offices.filter((o) => (cat === "all" || o.category === cat) && (!needle || fold(`${o.name} ${o.head ?? ""} ${o.address ?? ""}`).includes(needle))), [dir, cat, needle]);
  const pill = (on: boolean) => `inline-flex min-h-10 items-center gap-2 rounded-full px-4 text-sm font-semibold ${on ? "bg-fiesta-navy text-white" : "text-fiesta-navy hover:bg-fiesta-navy/10"}`;

  const body = (
    <section aria-label={name} className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <label className="min-w-0 flex-1 basis-60"><span className="sr-only">{t("lgu.dir.search")}</span>
          <input type="search" value={q} onChange={(e) => setQ(e.target.value)} autoComplete="off" placeholder={t("lgu.dir.search")} className="min-h-11 w-full rounded-full border-2 border-fiesta-navy/20 bg-white px-5 text-sm outline-none focus:border-fiesta-blue focus:ring-4 focus:ring-fiesta-blue/20" />
        </label>
        <div role="group" aria-label={t("lgu.dir.title")} className="inline-flex flex-wrap rounded-full bg-fiesta-navy/5 p-0.5">
          <button type="button" aria-pressed={cat === "all"} onClick={() => setCat("all")} className={pill(cat === "all")}>{t("lgu.dir.all")} <span className="tabular-nums opacity-80">{dir.offices.length}</span></button>
          {GROUPS.filter((g) => counts[g.key]).map((g) => <button key={g.key} type="button" aria-pressed={cat === g.key} onClick={() => setCat(g.key)} className={pill(cat === g.key)}>{t(g.label)} <span className="tabular-nums opacity-80">{counts[g.key]}</span></button>)}
        </div>
      </div>

      {rows.length ? (
        <ul className="divide-y divide-black/10 overflow-hidden rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
          {rows.map((o) => {
            const g = GROUPS.find((x) => x.key === o.category)!;
            return <OfficeRow key={o.name} icon={g.icon} color={g.color} bg={g.bg} name={o.name} head={o.head} address={o.address} phones={o.phone} emails={o.email} />;
          })}
        </ul>
      ) : <p className="rounded-2xl bg-white p-6 text-sm text-black/70 shadow-sm ring-1 ring-black/5">{t("lgu.dir.none")}</p>}

      {(dir.unlisted?.length || dir.staff?.length) ? (
        <div className="grid gap-4 md:grid-cols-2">
          {dir.unlisted?.length ? (
            <div className="rounded-2xl bg-fiesta-mint p-5">
              <p className="font-serif text-lg font-bold text-fiesta-navy"><T k="lgu.dir.unlisted" /></p>
              <ul className="mt-2 space-y-1.5 text-sm">{dir.unlisted.map((u) => <li key={u.office}><b>{u.office}</b> · {u.head}</li>)}</ul>
            </div>
          ) : null}
          {dir.staff?.length ? (
            <div className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5">
              <p className="font-serif text-lg font-bold text-fiesta-navy"><T k="lgu.dir.staff" /></p>
              <ul className="mt-2 space-y-1.5 text-sm">{dir.staff.map((u) => <li key={u.name}><b>{u.name}</b> · {u.role}</li>)}</ul>
            </div>
          ) : null}
        </div>
      ) : null}

      <p className="flex flex-wrap items-center gap-x-4 text-xs text-black/65">
        <a href={dir.source} rel="noopener" className="inline-flex min-h-11 items-center underline"><T k="common.source" /></a>
        {dir.headsSource && <a href={dir.headsSource} rel="noopener" className="inline-flex min-h-11 items-center underline"><T k="lgu.dir.heads" /></a>}
        <span><T k="common.checked" /> {dir.verifiedAt}</span>
        <span><T k="lgu.dir.note" /></span>
      </p>
    </section>
  );
  if (!collapsible) return body;
  return (
    <details className="group rounded-2xl bg-white shadow-sm ring-1 ring-black/5 open:pb-4">
      <summary className="flex min-h-14 cursor-pointer list-none items-center gap-3 rounded-2xl px-5 py-3 hover:bg-fiesta-cream/60 [&::-webkit-details-marker]:hidden">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-fiesta-blue/10"><KitIcon name="doc" color="#2b4fa3" className="h-5 w-5" /></span>
        <span className="flex-1 font-serif text-lg font-bold text-fiesta-navy"><T k="lgu.dir.title" /></span>
        <span className="rounded-full bg-fiesta-navy/5 px-3 py-1 text-sm font-bold tabular-nums text-fiesta-navy">{dir.offices.length}</span>
        <KitIcon name="arrow" className="h-5 w-5 shrink-0 rotate-90 text-fiesta-blue transition group-open:-rotate-90" />
      </summary>
      <div className="px-4 pt-1">{body}</div>
    </details>
  );
}
