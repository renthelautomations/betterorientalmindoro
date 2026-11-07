import type { Metadata } from "next";
import Link from "next/link";
import { StatCard } from "@/components/kit/Parts";
import PageTitle from "@/components/site/PageTitle";
import { Breadcrumbs } from "@/components/kit/Ui";
import { getProvinceStats, fmtInt } from "@/lib/stats";
import { getProjectStats } from "@/lib/projects";

export const metadata: Metadata = { title: "Datos" };

export default function Datos() {
  const pop = getProvinceStats().population;
  const latest = pop[pop.length - 1];
  const cards = [
    { href: "/estatistika", label: "ESTATISTIKA", value: fmtInt(latest?.value), hint: `Populasyon, ${latest?.asOf?.slice(0, 4) ?? ""}. Laki, kita at barangay ng bawat bayan.`, icon: "people" as const, color: "#1f7a8c" },
    { href: "/proyekto", label: "PROYEKTO", value: fmtInt(getProjectStats().total), hint: "Mga proyekto ng DPWH sa lalawigan, na may mapa.", icon: "road" as const, color: "#b5532f" },
    { href: "/badyet", label: "BADYET", value: "2", hint: "Dalawang distrito: ang budget ng DPWH, 2020 hanggang 2027.", icon: "budget" as const, color: "#2f6b4f" },
    { href: "/dynasties", label: "DINASTIYA", value: "2001-2025", hint: "Sino ang nahalal at aling mga apelyido ang paulit-ulit.", icon: "doc" as const, color: "#6b4a2f" },
  ];
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "Datos" }]} />
      <div className="mt-4"><PageTitle eyebrow="TRANSPARENCY" title="Datos ng lalawigan" /></div>
      <p className="mt-4 max-w-2xl text-black/70">Apat na paraan para tingnan ang Oriental Mindoro sa numero. Bawat isa ay may source, petsa at paliwanag kung paano basahin.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2">
        {cards.map((c) => (
          <li key={c.href}><Link href={c.href} className="block rounded-2xl focus-visible:outline-offset-4 hover:shadow-md"><StatCard label={c.label} value={c.value} hint={c.hint} icon={c.icon} color={c.color} /></Link></li>
        ))}
      </ul>
    </main>
  );
}
