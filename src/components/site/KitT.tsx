"use client";
// Client wrappers that run kit components' plain-string props through the dictionary (unknown strings pass through).
import { useT } from "@/lib/i18n/i18n";
import { SectionHeader, Callout, PillarCard, StatCard } from "@/components/kit/Parts";
import { Breadcrumbs } from "@/components/kit/Ui";
import PageTitle from "@/components/site/PageTitle";
import type { ComponentProps } from "react";

export function SectionHeaderT(p: ComponentProps<typeof SectionHeader>) { const t = useT(); return <SectionHeader {...p} eyebrow={t(p.eyebrow)} title={t(p.title)} />; }
export function PageTitleT(p: ComponentProps<typeof PageTitle>) { const t = useT(); return <PageTitle {...p} eyebrow={t(p.eyebrow)} title={t(p.title)} />; }
export function CalloutT(p: ComponentProps<typeof Callout>) { const t = useT(); return <Callout {...p} title={t(p.title)} />; }
export function PillarCardT(p: ComponentProps<typeof PillarCard>) { const t = useT(); return <PillarCard {...p} blurb={t(p.blurb)} />; }
export function BreadcrumbsT({ items }: ComponentProps<typeof Breadcrumbs>) { const t = useT(); return <Breadcrumbs items={items.map((i) => ({ ...i, label: t(i.label) }))} />; }
/** StatCard whose hint may start with a number or year that stays outside the dictionary: `lead` + translated hint. */
export function StatCardT({ lead, hint, ...p }: ComponentProps<typeof StatCard> & { lead?: string }) { const t = useT(); return <StatCard {...p} hint={lead ? `${lead} ${t(hint)}` : hint} />; }
/** A landmark whose aria-label is a dictionary key. */
export function Landmark({ as: Tag, label, ...p }: { as: "section" | "aside"; label: string } & React.HTMLAttributes<HTMLElement>) { const t = useT(); return <Tag aria-label={t(label)} {...p} />; }
