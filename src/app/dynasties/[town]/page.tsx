import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Attribution from "@/components/dynasties/Attribution";
import HowToRead from "@/components/dynasties/HowToRead";
import OfficeholderTable from "@/components/dynasties/OfficeholderTable";
import SurnameTable from "@/components/dynasties/SurnameTable";
import { getProvince, getTown, POSITIONS, POSITION_LABEL, sharedSurnames } from "@/lib/dynasties";
import { getMunicipality } from "@/lib/municipalities";

export function generateStaticParams() {
  return getProvince().towns.map((town) => ({ town }));
}

export async function generateMetadata({ params }: PageProps<"/dynasties/[town]">): Promise<Metadata> {
  const { town } = await params;
  const m = getMunicipality(town);
  return m ? { title: `Dynasties: ${m.name}` } : {};
}

export default async function TownDynasties({ params }: PageProps<"/dynasties/[town]">) {
  const { town } = await params;
  const m = getMunicipality(town);
  const t = getTown(town);
  if (!m || !t) notFound();
  return (
    <main className="mx-auto max-w-3xl px-4 py-10">
      <Link href="/dynasties" className="text-sm underline">← Lahat ng bayan</Link>
      <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">{m.name}</h1>
      <p className="mt-2 text-black/70">Mga nahalal na opisyal at paulit-ulit na apelyido, 2001–2025.</p>
      <HowToRead />

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">PAULIT-ULIT NA APELYIDO</h2>
      <p className="mt-2 text-sm text-black/70">Apelyidong hawak ng dalawa o higit pang magkaibang tao sa mga nanalo (lahat ng taon).</p>
      <SurnameTable rows={sharedSurnames(t.contests)} />

      {POSITIONS.map((pos) => (
        <section key={pos}>
          <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">{POSITION_LABEL[pos].toUpperCase()} BAWAT HALALAN</h2>
          <OfficeholderTable contests={t.contests} position={pos} />
        </section>
      ))}
      <Attribution />
    </main>
  );
}
