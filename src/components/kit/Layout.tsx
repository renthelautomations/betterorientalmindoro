import Link from "next/link";
import Logo from "@/components/Logo";
import KitIcon from "./KitIcon";
import { T, LangToggle } from "@/lib/i18n/i18n";
import { Divider } from "./Motifs";

/** Stand-in for the toggle while the real site header is still the old one: templates show it above the page. */
export function DemoLangBar() {
  return <div className="mx-auto flex max-w-6xl justify-end px-4 py-2"><LangToggle /></div>;
}

export type NavLink = { label: string; href: string };
const STRIPE = "repeating-linear-gradient(90deg,#e8552d 0 24px,#3aa65b 24px 48px,#4aa3d8 48px 72px,#f4b92e 72px 96px)";

/** Desktop: inline links. Mobile: native <details> menu (no JS). */
export function KitHeader({ links }: { links: NavLink[] }) {
  return (
    <header className="bg-fiesta-cream">
      <div className="h-1.5" style={{ background: STRIPE }} aria-hidden />
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" aria-label="better Oriental Mindoro home"><Logo /></Link>
        <nav aria-label="Main" className="hidden gap-1 xl:flex">
          {links.map((l) => <Link key={l.label} href={l.href} className="inline-flex min-h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-fiesta-navy/5"><T k={l.label} /></Link>)}
        </nav>
        <LangToggle className="ml-auto mr-2 xl:ml-4 xl:mr-0" />
        <details className="group relative xl:hidden">
          <summary className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg hover:bg-fiesta-navy/5 [&::-webkit-details-marker]:hidden" aria-label="Menu"><KitIcon name="menu" /></summary>
          <ul className="absolute right-0 z-10 mt-2 w-56 rounded-2xl bg-white p-2 shadow-lg ring-1 ring-black/10">
            {links.map((l) => <li key={l.label}><Link href={l.href} className="flex min-h-11 items-center rounded-lg px-3 text-sm font-medium hover:bg-fiesta-mint"><T k={l.label} /></Link></li>)}
          </ul>
        </details>
      </div>
    </header>
  );
}

export function KitFooter({ links, sources }: { links: NavLink[]; sources?: NavLink[] }) {
  return (
    <footer className="bg-fiesta-navy text-white">
      <Divider variant="mahaltana" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-10 md:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 font-semibold"><T k="footer.tagline" /></p>
          <p className="mt-2 max-w-md text-sm text-white/75"><T k="footer.disclaimer" /></p>
        </div>
        <nav aria-label="Quick links"><p className="text-sm font-semibold tracking-widest text-fiesta-yellow"><T k="footer.links" /></p><ul className="mt-3 space-y-1">{links.map((l) => <li key={l.label}><Link href={l.href} className="inline-block py-1.5 text-sm text-white/85 hover:underline"><T k={l.label} /></Link></li>)}</ul></nav>
        <nav aria-label="Sources"><p className="text-sm font-semibold tracking-widest text-fiesta-yellow"><T k="footer.sources" /></p><ul className="mt-3 space-y-1">{(sources ?? []).map((l) => <li key={l.label}><a href={l.href} className="inline-block py-1.5 text-sm text-white/85 hover:underline"><T k={l.label} /></a></li>)}</ul></nav>
      </div>
    </footer>
  );
}
