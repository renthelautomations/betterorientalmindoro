"use client";
import { Breadcrumbs, EmptyState } from "@/components/kit/Ui";
import DataTable from "@/components/kit/DataTable";
import { Donut, type Slice } from "@/components/kit/Charts2";
import PageTitle from "@/components/site/PageTitle";
import { T, useT } from "@/lib/i18n/i18n";

// Small client wrappers: the kit/site parts below take plain strings, so keys are resolved here.
export function BayanCrumbs({ items }: { items: { label: string; href?: string; plain?: boolean }[] }) {
  const t = useT();
  return <Breadcrumbs items={items.map((i) => ({ label: i.plain ? i.label : t(i.label), href: i.href }))} />;
}

export function BayanTitle({ eyebrow, title, plain }: { eyebrow: string; title: string; plain?: boolean }) {
  const t = useT();
  return <PageTitle eyebrow={t(eyebrow)} title={plain ? title : t(title)} color="#8a3a18" />;
}

/** title/body are dictionary keys; "{name}" in the title is replaced with the town name. */
export function BayanEmpty({ title, body, name = "" }: { title: string; body: string; name?: string }) {
  const t = useT();
  return <EmptyState title={t(title).replace("{name}", name)}><T k={body} /></EmptyState>;
}

export function BayanDonut({ slices, centerLabel }: { slices: Slice[]; centerLabel: string }) {
  const t = useT();
  return <Donut slices={slices.map((s) => ({ ...s, label: t(s.label) }))} format={(n) => n.toLocaleString("en-PH")} centerLabel={centerLabel} />;
}

type Row = { name: string; kind: string; pop: number | null; trend: number[] | null; area: number };
export function BayanTable({ rows }: { rows: Row[] }) {
  const t = useT();
  return <DataTable caption={t("bayan.table.caption")} filterKey="name" rows={rows.map((r) => ({ ...r, kind: t(r.kind) }))}
    cols={[{ key: "name", label: "table.name" }, { key: "kind", label: "table.kind" }, { key: "pop", label: "table.pop", align: "right", format: "int" }, { key: "trend", label: "table.trend", format: "spark" }, { key: "area", label: "table.area", align: "right", format: "int" }]} />;
}
