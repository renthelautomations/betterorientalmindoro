"use client";
import { useEffect, useRef } from "react";
import DataTable from "@/components/kit/DataTable";
import { useT } from "@/lib/i18n/i18n";

/** Search box: the placeholder must be a string, so it lives in a client component. */
export function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const t = useT();
  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);
  useEffect(() => () => clearTimeout(timer.current), []);
  // results update as you type: the form re-submits shortly after the last keystroke
  return (
    <label className="block min-w-0"><span className="sr-only">{t("proyekto.searchlabel")}</span>
      <input name="q" type="search" autoComplete="off" defaultValue={defaultValue} placeholder={t("proyekto.searchph")}
        onChange={(e) => { const form = e.currentTarget.form; clearTimeout(timer.current); timer.current = setTimeout(() => form?.requestSubmit(), 350); }}
        className="min-h-12 w-full rounded-full border-2 border-fiesta-navy/20 bg-white px-5 text-base outline-none focus:border-fiesta-blue focus:ring-4 focus:ring-fiesta-blue/20" /></label>
  );
}

type Row = { title: string; year: number | null; cost: number | null };
/** DataTable with a translated screen-reader caption. */
export function TopTable({ rows }: { rows: Row[] }) {
  const t = useT();
  return <DataTable caption={t("proyekto.topcaption")} filterKey="title" rows={rows} cols={[{ key: "title", label: "table.project" }, { key: "year", label: "table.year" }, { key: "cost", label: "proyekto.budget", align: "right", format: "peso" }]} />;
}
