import Link from "next/link";
import IconTile from "@/components/IconTile";
import { ICON_KEYS, SITE } from "@/lib/brand";

const CIVIC: { label: string; href?: string }[] = [
  { label: "Hotlines", href: "/hotlines" },
  { label: "Proyekto", href: "/proyekto" },
  { label: "Badyet" },
  { label: "Halalan" },
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
                <Link href={c.href} className="inline-block rounded-full border border-black/20 px-5 py-2 text-sm font-medium hover:bg-black/5">{c.label}</Link>
              ) : (
                <span className="inline-block rounded-full border border-dashed border-black/20 px-5 py-2 text-sm text-black/50">{c.label} · coming soon</span>
              )}
            </li>
          ))}
        </ul>
        <p className="mt-6 text-sm text-black/60">
          O tingnan ang <Link href="/bayan" className="underline">mapa ng 15 bayan at lungsod</Link>.
        </p>
      </section>
    </main>
  );
}
