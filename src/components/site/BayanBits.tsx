"use client";
import { Breadcrumbs, EmptyState } from "@/components/kit/Ui";
import TownDataTable from "@/components/site/TownDataTable";
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

type Row = { slug: string; name: string; kind: string; pop: number | null; trend: number[] | null; area: number };
export function BayanTable({ rows }: { rows: Row[] }) {
  const t = useT();
  return <TownDataTable caption={t("bayan.table.caption")} rows={rows.map((r) => ({ slug: r.slug, name: r.name, isCity: r.kind === "town.city", pop: r.pop, trend: r.trend, area: r.area }))} />;
}
