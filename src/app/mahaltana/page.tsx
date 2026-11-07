import type { Metadata } from "next";
import Link from "next/link";
import { PillarCard } from "@/components/kit/Parts";
import PageTitle from "@/components/site/PageTitle";
import { Breadcrumbs } from "@/components/kit/Ui";
import { ICONS, ICON_KEYS } from "@/lib/brand";
import type { PatternKey } from "@/components/kit/Patterns";

export const metadata: Metadata = { title: "MaHalTaNa" };
const PATTERN: Record<(typeof ICON_KEYS)[number], PatternKey> = { ma: "dotblocks", hal: "peaks", ta: "horns", na: "wave" };

export default function MaHalTaNa() {
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <Breadcrumbs items={[{ label: "Home", href: "/" }, { label: "MaHalTaNa" }]} />
      <div className="mt-4"><PageTitle eyebrow="MAHALTANA" title="Apat na haligi ng Oriental Mindoro" /></div>
      <p className="mt-4 max-w-2xl text-black/70">Mangyan, Mount Halcon, Tamaraw at Naujan Lake: ang apat na simbolo ng ating lalawigan.</p>
      <ul className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {ICON_KEYS.map((k) => {
          const i = ICONS[k];
          return <li key={k}><Link href={`/${k}`} className="block rounded-2xl hover:shadow-md"><PillarCard short={i.short} name={i.name} blurb={i.blurb} color={i.color} pattern={PATTERN[k]} /></Link></li>;
        })}
      </ul>
    </main>
  );
}
