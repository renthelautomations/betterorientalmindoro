import Link from "next/link";
import Logo from "@/components/Logo";
import { Divider } from "@/components/kit/Motifs";
import KitIcon from "@/components/kit/KitIcon";
import Icon from "@/components/ui/Icon";
import FooterSocial from "./FooterSocial";
import VisitCounter from "./VisitCounter";
import { Landmark } from "./KitT";
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

/** Our own footer: brand and visitors, four link columns, an emergency strip, then credits. Replaces the kit footer and the old credit bar. */
export default function SiteFooter() {
  return (
    <footer className="bg-fiesta-navy text-white">
      <Divider variant="mahaltana" />
      <div className="mx-auto grid max-w-6xl gap-10 px-4 pb-8 pt-12 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,2fr)]">
        <div>
          <Logo tone="light" />
          <p className="mt-4 font-serif text-xl font-bold"><T k="footer.tagline" /></p>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-white/80"><T k="footer.disclaimer" /></p>
          <div className="mt-5 flex flex-wrap items-center gap-x-5 gap-y-3"><FooterSocial /></div>
          <div className="mt-6 min-h-[4.5rem]"><VisitCounter /></div>
        </div>
        <div className="grid grid-cols-2 gap-x-6 gap-y-8 sm:grid-cols-4">
          <Col title="foot.explore" links={NAV} />
          <Col title="foot.help" links={HELP} />
          <Col title="foot.data" links={FOOTER_SOURCES} external />
          <Col title="foot.about" links={ABOUT} />
        </div>
      </div>

      <Landmark as="section" label="home.foot.aria" className="mx-auto max-w-6xl px-4 pb-8">
        <div className="flex flex-wrap items-center justify-between gap-4 rounded-2xl bg-[#a8281b] px-5 py-4">
          <p className="flex items-center gap-3 text-sm font-semibold"><KitIcon name="alert" color="#fff" className="h-6 w-6 shrink-0" /><T k="foot.call" /></p>
          <div className="flex flex-wrap items-center gap-3">
            <a href="tel:911" className="inline-flex min-h-11 items-center gap-2 rounded-xl bg-white px-5 font-serif text-xl font-bold text-[#a8281b]"><KitIcon name="phone" className="h-5 w-5" />911</a>
            <Link href="/hotlines" className="inline-flex min-h-11 items-center rounded-xl border-2 border-white/70 px-4 text-sm font-semibold hover:bg-white hover:text-[#a8281b]"><T k="home.help.all" /></Link>
          </div>
        </div>
      </Landmark>

      <div className="border-t border-white/10">
        <div className="mx-auto max-w-6xl space-y-2 px-4 py-6 text-xs text-white/75">
          <p><T k="home.foot.cited" /></p>
          <p className="flex flex-wrap items-center gap-x-4 gap-y-2">
            <span>© 2026 Better Oriental Mindoro</span>
            <Link href={`${SITE.github}/blob/main/LICENSE`} {...ext} className="hover:text-white hover:underline">MIT</Link>
            <a href="https://github.com/renthelautomations" {...ext} className="inline-flex items-center gap-1.5 hover:text-white"><Icon name="heart" className="h-3.5 w-3.5" /><T k="home.foot.built" /> <b className="font-semibold text-white">Renthel Cueto</b></a>
            <a href={`${SITE.github}/commits/main`} {...ext} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white"><Icon name="gear" className="h-3.5 w-3.5" /><T k="home.foot.ver" /> {pkg.version}</a>
          </p>
        </div>
      </div>
    </footer>
  );
}
