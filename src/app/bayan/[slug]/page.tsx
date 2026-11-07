import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import MunicipalityStats from "@/components/stats/MunicipalityStats";
import HotlineList from "@/components/HotlineList";
import { getHotlines } from "@/lib/hotlines";
import { getProjects } from "@/lib/projects";
import { getBarangays, getMunicipalities, getMunicipality } from "@/lib/municipalities";

export function generateStaticParams() {
  return getMunicipalities().map((m) => ({ slug: m.slug }));
}

export async function generateMetadata({ params }: PageProps<"/bayan/[slug]">): Promise<Metadata> {
  const { slug } = await params;
  const m = getMunicipality(slug);
  return m ? { title: m.name } : {};
}

export default async function MunicipalityPage({ params }: PageProps<"/bayan/[slug]">) {
  const { slug } = await params;
  const m = getMunicipality(slug);
  if (!m) notFound();
  const barangays = getBarangays(m.pcode);
  const projects = [...getProjects(m.slug)].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0));
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <Link href="/bayan" className="text-sm underline">← Lahat ng bayan</Link>
      <h1 className="mt-3 font-serif text-3xl font-bold md:text-4xl">{m.name}</h1>
      <p className="mt-2 text-black/70">
        {m.isCity ? "Lungsod" : "Bayan"} ng Oriental Mindoro · {m.areaKm2.toLocaleString()} km² · {barangays.length} barangay
      </p>
      <MunicipalityStats slug={m.slug} areaKm2={m.areaKm2} barangays={barangays.length} />
      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">MGA HOTLINE</h2>
      <div className="mt-3"><HotlineList rows={getHotlines(m.slug)} /></div>
      <p className="mt-3 text-sm">Hotlines ng buong lalawigan: <Link href="/hotlines" className="underline">tingnan dito</Link>.</p>

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">MGA PROYEKTO NG DPWH</h2>
      {projects.length ? (
        <>
          <p className="mt-2 text-sm text-black/70">{projects.length.toLocaleString()} proyekto ayon sa coordinates. Ipinapakita ang 10 pinakamalaki.</p>
          <ul className="mt-3 space-y-2 text-sm">
            {projects.slice(0, 10).map((p) => <li key={p.id}>{p.title}{p.cost ? ` (₱${Math.round(p.cost).toLocaleString("en-PH")})` : ""}</li>)}
          </ul>
        </>
      ) : <p className="mt-2 text-sm text-black/60">Walang naitalang proyekto para sa bayang ito sa dataset.</p>}

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">MGA BARANGAY</h2>
      <ul className="mt-3 grid grid-cols-2 gap-x-6 gap-y-1 text-sm md:grid-cols-3">
        {barangays.map((b) => <li key={b}>{b}</li>)}
      </ul>
      <p className="mt-6 text-xs text-black/50">Source: NAMRIA/PSA boundaries via BetterGov Open Data (MIT).</p>
    </main>
  );
}
