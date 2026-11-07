"use client";
import Link from "next/link";
import { ServiceRow } from "@/components/kit/Parts";
import { useT } from "@/lib/i18n/i18n";
import { iconFor, peso } from "./ProjectBits";

/** One result card: the whole row is a link to the record. */
export default function ProjectCard({ id, title, bayan, year, status, cost, category }: { id: string; title: string; bayan?: string; year?: number; status?: string; cost?: number; category?: string }) {
  const t = useT();
  const sub = [bayan ?? t("proyekto.unsure"), year, status, cost != null ? `${peso(cost)} ${t("proyekto.budgetword")}` : null].filter(Boolean).join(" · ");
  return <Link href={`/proyekto/${id}`} className="block rounded-xl focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-blue"><ServiceRow icon={iconFor(category)} title={title} sub={sub} color="#1b2a4a" /></Link>;
}
