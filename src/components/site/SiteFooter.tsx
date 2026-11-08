import Link from "next/link";
import Logo from "@/components/Logo";
import { Divider } from "@/components/kit/Motifs";
import Icon from "@/components/ui/Icon";
import FooterSocial from "./FooterSocial";
import VisitCounter from "./VisitCounter";
import { VolunteerButton } from "./VolunteerDialog";
import { NAV, FOOTER_LINKS, FOOTER_SOURCES } from "./nav";
import { T } from "@/lib/i18n/i18n";
import { SITE } from "@/lib/brand";
import pkg from "../../../package.json";

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;
const HELP = [{ label: "nav.hotlines", href: "/hotlines" }, { label: "nav.services", href: "/serbisyo" }, { label: "nav.faq", href: "/faq" }, { label: "nav.access", href: "/accessibility" }];
const ABOUT = FOOTER_LINKS.filter((l) => ["/terms", "/privacy"].includes(l.href));

function Col({ title, links, external }: { title: string; links: { label: string; href: string }[]; external?: boolean }) {
  return (
    <nav aria-label="Footer">
      <p className="text-xs font-semibold tracking-widest text-fiesta-yellow uppercase"><T k={title} /></p>
      <ul className="mt-3 space-y-0.5">
        {links.map((l) => (
          <li key={l.href}>{external
            ? <a href={l.href} {...ext} className="inline-flex min-h-9 items-center text-sm text-white/85 hover:text-white hover:underline">{l.label}</a>
            : <Link href={l.href} className="inline-flex min-h-9 items-center text-sm text-white/85 hover:text-white hover:underline"><T k={l.label} /></Link>}</li>
        ))}
      </ul>
    </nav>
  );
}

/** Our own footer: brand and visitors, four link columns, then credits with a small visit count. Replaces the kit footer and the old credit bar. */
export default function SiteFooter() {
  return (
    <footer className="bg-fiesta-navy text-white">
      <Divider variant="mahaltana" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-8 pt-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 font-serif text-xl font-bold"><T k="footer.tagline" /></p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80"><T k="footer.disclaimer" /></p>
          <VolunteerButton className="mt-5 inline-flex min-h-11 items-center rounded-full bg-fiesta-orange px-5 text-sm font-bold text-fiesta-navy transition hover:brightness-95 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-fiesta-yellow"><T k="vol.title" /></VolunteerButton>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3"><FooterSocial /></div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:flex sm:justify-between sm:gap-x-8">
          <Col title="foot.explore" links={NAV} />
          <Col title="foot.help" links={HELP} />
          <Col title="foot.data" links={FOOTER_SOURCES} external />
          <Col title="foot.about" links={ABOUT} />
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-end justify-between gap-x-6 gap-y-3 px-4 py-6 text-xs text-white/75">
          <div className="space-y-2">
            <p><T k="home.foot.cited" /></p>
            <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
              <span>© 2026 Better Oriental Mindoro</span>
              <Link href={`${SITE.github}/blob/main/LICENSE`} {...ext} className="hover:text-white hover:underline">MIT</Link>
              <a href="https://github.com/renthelautomations" {...ext} className="inline-flex items-center gap-1.5 hover:text-white"><Icon name="heart" className="h-3.5 w-3.5" /><T k="home.foot.built" /> <b className="font-semibold text-white">Renthel Cueto</b></a>
              <a href={`${SITE.github}/commits/main`} {...ext} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white"><Icon name="gear" className="h-3.5 w-3.5" /><T k="home.foot.ver" /> {pkg.version}</a>
            </p>
          </div>
          <VisitCounter />
        </div>
      </div>
    </footer>
  );
}
