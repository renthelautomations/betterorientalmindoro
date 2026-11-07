import type { Metadata } from "next";
import Link from "next/link";
import ServiceList from "@/components/services/ServiceList";
import { getCategories, getLifeEvents, getServices, servicesForEvent } from "@/lib/services";

export const metadata: Metadata = { title: "Serbisyo", description: "Mga serbisyo ng gobyerno sa Oriental Mindoro: kailangan, bayad, hakbang at opisina, may source bawat isa." };

export default function Serbisyo() {
  return (
    <main className="mx-auto max-w-4xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold md:text-4xl">Mga serbisyo</h1>
      <p className="mt-2 text-black/70">Alamin kung ano ang kailangan, magkano, at saan pupunta. Bawat entry ay may link sa opisyal na source at petsa ng huling tingin.</p>
      <p className="mt-2 text-sm text-black/60">Lahat ay <b>draft para sa review ng volunteers</b>. Kapag walang nakumpirmang detalye, nakasulat na &quot;Alamin sa opisina&quot;. Hindi ito opisyal na website ng gobyerno.</p>

      <h2 className="mt-10 text-sm font-semibold tracking-widest text-black/60">PUMILI NG KATEGORYA</h2>
      <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {getCategories().map((c) => (
          <li key={c.slug}>
            <Link href={`/serbisyo/${c.slug}`} className="block h-full rounded-xl border border-black/10 bg-white p-4 hover:border-[var(--navy)]">
              <span className="font-serif text-lg font-bold">{c.name}</span>
              <span className="mt-1 block text-sm text-black/60">{c.blurb}</span>
              <span className="mt-2 block text-xs text-black/50">{getServices(c.slug).length} serbisyo</span>
            </Link>
          </li>
        ))}
      </ul>

      <h2 className="mt-12 text-sm font-semibold tracking-widest text-black/60">O PUMILI AYON SA PANGYAYARI SA BUHAY</h2>
      <div className="mt-3 grid gap-6 md:grid-cols-2">
        {getLifeEvents().map((e) => (
          <section key={e.slug} aria-label={e.name}>
            <h3 className="font-serif text-xl font-bold">{e.name}</h3>
            <p className="mb-2 text-sm text-black/60">{e.blurb}</p>
            <ServiceList rows={servicesForEvent(e.slug)} />
          </section>
        ))}
      </div>
    </main>
  );
}
