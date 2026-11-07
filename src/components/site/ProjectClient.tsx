"use client";
import DataTable from "@/components/kit/DataTable";
import { useT } from "@/lib/i18n/i18n";

/** Search box: the placeholder must be a string, so it lives in a client component. */
export function SearchInput({ defaultValue }: { defaultValue?: string }) {
  const t = useT();
  return (
    <label className="block min-w-0"><span className="sr-only">{t("proyekto.searchlabel")}</span>
      <input name="q" defaultValue={defaultValue} placeholder={t("proyekto.searchph")} className="min-h-11 w-full rounded-lg border border-black/25 bg-white px-3 text-sm outline-none focus:border-fiesta-blue focus:ring-2 focus:ring-fiesta-blue/25" /></label>
  );
}

type Row = { title: string; year: number | null; cost: number | null };
/** DataTable with a translated screen-reader caption. */
export function TopTable({ rows }: { rows: Row[] }) {
  const t = useT();
  return <DataTable caption={t("proyekto.topcaption")} filterKey="title" rows={rows} cols={[{ key: "title", label: "table.project" }, { key: "year", label: "table.year" }, { key: "cost", label: "proyekto.budget", align: "right", format: "peso" }]} />;
}
