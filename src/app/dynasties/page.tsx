import type { Metadata } from "next";
import Link from "next/link";
import Attribution from "@/components/dynasties/Attribution";
import HowToRead from "@/components/dynasties/HowToRead";
import SurnameTable from "@/components/dynasties/SurnameTable";
import { getProvince, getTown, provinceSurnames, type Town } from "@/lib/dynasties";
import { getMunicipalities } from "@/lib/municipalities";

export const metadata: Metadata = { title: "Dynasties", description: "Mga apelyidong paulit-ulit sa halalan ng Oriental Mindoro, 2001–2025." };

export default function Dynasties() {
  const p = getProvince();
  const towns = p.towns.map(getTown).filter((t): t is Town => !!t);
  const names = getMunicipalities();
  const first = p.elections[0]?.year;
  const last = p.elections.at(-1)?.year;
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold md:text-4xl">Mga dinastiya sa halalan</h1>
      <p className="mt-2 text-black/70">
        Sino ang nahalal bilang mayor, vice mayor, at konsehal sa bawat bayan ng Oriental Mindoro, at aling mga apelyido ang paulit-ulit sa talaan mula {first} hanggang {last}.
      </p>
      <HowToRead />

      <dl className="mt-8 grid grid-cols-3 gap-3 text-center">
        <div className="rounded-xl border border-black/10 bg-white p-3"><dt className="text-xs text-black/60">Poverty incidence (PSA)</dt><dd className="font-serif text-2xl font-bold text-[var(--navy)]">{p.poverty != null ? `${p.poverty}%` : "N/A"}</dd></div>
        <div className="rounded-xl border border-black/10 bg-white p-3"><dt className="text-xs text-black/60">Halalan na saklaw</dt><dd className="font-serif text-2xl font-bold text-[var(--navy)]">{p.elections.length}</dd></div>
        <div className="rounded-xl border border-black/10 bg-white p-3"><dt className="text-xs text-black/60">Bayan</dt><dd className="font-serif text-2xl font-bold text-[var(--navy)]">{towns.length}</dd></div>
      </dl>

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">PINAKAMARAMING PANALO BAWAT APELYIDO</h2>
      <p className="mt-2 text-sm text-black/70">Lokal na posisyon lang (mayor, vice mayor, konsehal), lahat ng taon. Apelyido lang ang batayan.</p>
      <SurnameTable rows={provinceSurnames(towns, 10)} />

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">PUMILI NG BAYAN</h2>
      <ul className="mt-3 grid grid-cols-2 gap-2 md:grid-cols-3">
        {names.filter((m) => p.towns.includes(m.slug)).map((m) => (
          <li key={m.slug}><Link href={`/dynasties/${m.slug}`} className="block rounded-xl border border-black/10 bg-white px-4 py-3 font-medium hover:border-[var(--navy)]">{m.name}</Link></li>
        ))}
      </ul>
      <Attribution />
    </main>
  );
}
