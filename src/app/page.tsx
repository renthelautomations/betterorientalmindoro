import Link from "next/link";
import IconTile from "@/components/IconTile";
import { ICON_KEYS, SITE } from "@/lib/brand";

// Add { label, href } here to add a pill; omit href for a "coming soon" pill. Pills wrap.
const CIVIC: { label: string; href?: string }[] = [
  { label: "Serbisyo", href: "/serbisyo" },
  { label: "Hotlines", href: "/hotlines" },
  { label: "Proyekto", href: "/proyekto" },
  { label: "Estatistika", href: "/estatistika" },
  { label: "Dinastiya", href: "/dynasties" },
  { label: "Badyet" },
];

export default function Home() {
  return (
    <main className="mx-auto max-w-6xl px-4">
      <section className="py-14 md:py-20">
        <p className="text-sm font-semibold tracking-widest text-[var(--na)]">MAHALTANA</p>
        <h1 className="mt-3 max-w-3xl font-serif text-4xl font-bold leading-tight md:text-6xl">{SITE.tagline}</h1>
        <p className="mt-5 max-w-2xl text-lg text-black/70">
          Mangyan, Mount Halcon, Tamaraw, Naujan Lake: ang kuwento ng ating lalawigan, at ang mga serbisyo at
          impormasyong para sa bayan.
        </p>
      </section>

      <section aria-label="MaHalTaNa" className="grid grid-cols-2 gap-3 md:grid-cols-4 md:gap-4">
        {ICON_KEYS.map((k) => <IconTile key={k} icon={k} />)}
      </section>

      <section aria-label="Serbisyo para sa bayan" className="mt-14 border-t border-black/10 py-8">
        <h2 className="text-sm font-semibold tracking-widest text-black/60">PARA SA BAYAN</h2>
        <ul className="mt-4 flex flex-wrap gap-3">
          {CIVIC.map((c) => (
            <li key={c.label}>
              {c.href ? (
                <Link href={c.href} className="inline-flex min-h-11 items-center rounded-full border border-black/20 px-5 text-sm font-medium hover:bg-black/5">{c.label}</Link>
              ) : (
                <span className="inline-flex min-h-11 items-center rounded-full border border-dashed border-black/20 px-5 text-sm text-black/65">{c.label} · coming soon</span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-black/60">
          O tingnan ang <Link href="/bayan" className="inline-block py-2 underline">mapa ng 15 bayan at lungsod</Link>.
        </p>
      </section>
    </main>
  );
}
