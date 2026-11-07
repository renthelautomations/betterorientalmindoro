import type { Metadata } from "next";
import Link from "next/link";
import MapLoader from "@/components/MapLoader";
import { getMunicipalities } from "@/lib/municipalities";

export const metadata: Metadata = { title: "Bayan" };

export default function Bayan() {
  const list = getMunicipalities();
  const slugs = Object.fromEntries(list.map((m) => [m.pcode, m.slug]));
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold md:text-4xl">Mga bayan at lungsod</h1>
      <p className="mt-2 text-black/70">14 bayan at 1 lungsod ng Oriental Mindoro. Pindutin ang mapa o pumili sa listahan.</p>
      <div className="mt-6"><MapLoader slugs={slugs} /></div>
      <ul className="mt-8 grid grid-cols-2 gap-2 md:grid-cols-3 lg:grid-cols-5">
        {list.map((m) => (
          <li key={m.slug}>
            <Link href={`/bayan/${m.slug}`} className="block rounded-lg border border-black/10 px-4 py-3 text-sm font-medium hover:bg-black/5">{m.name}</Link>
          </li>
        ))}
      </ul>
    </main>
  );
}
