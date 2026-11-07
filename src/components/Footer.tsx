import Image from "next/image";
import Link from "next/link";
import Logo from "./Logo";
import Icon from "./ui/Icon";
import BrandIcon from "./ui/BrandIcon";
import { SITE } from "@/lib/brand";
import pkg from "../../package.json";

const LINKS = [
  { href: "/sitemap.xml", label: "Sitemap" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/faq", label: "FAQ" },
];

const SOCIAL = [
  { href: SITE.github, label: "Better Oriental Mindoro on GitHub", icon: "github" as const },
  { href: "https://discord.com/invite/qeSu7RJkjQ", label: "BetterGov.PH community on Discord", icon: "discord" as const },
];

const ext = { target: "_blank", rel: "noopener noreferrer" } as const;

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#1b2a4a] text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[2fr_1fr]">
        <div>
          <Logo tone="light" />
          <p className="mt-6 font-semibold text-white">{SITE.tagline}</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed">
            This website is a volunteer-led civic website under BetterGov.PH initiative. Not affiliated with or
            representing the Oriental Mindoro provincial government or any LGU. 100% free, volunteer-run and community-based.
          </p>
          <p className="mt-4 text-sm font-semibold text-white">Cost to the People of Oriental Mindoro: ₱0</p>
          <div className="mt-6 flex items-center gap-5">
            {SOCIAL.map((s) => (
              <a key={s.href} href={s.href} aria-label={s.label} title={s.label} {...ext} className="inline-flex h-11 w-11 items-center justify-center rounded-full text-white/80 hover:bg-white/10 hover:text-white">
                <BrandIcon name={s.icon} className="h-7 w-7" />
              </a>
            ))}
          </div>
          <a href="https://bettergov.ph" aria-label="BetterGov.PH" title="BetterGov.PH" {...ext} className="mt-4 inline-block opacity-70 hover:opacity-100">
            <Image src="/brand/bettergov-icon-white.svg" alt="BetterGov.PH" width={72} height={72} />
          </a>
        </div>
        <nav aria-label="Quick links">
          <h2 className="font-semibold text-white">Quick Links</h2>
          <ul className="mt-3 space-y-2 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className="inline-block py-1 hover:underline">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-x-8 gap-y-3 px-4 py-6 text-xs">
          <p className="flex flex-wrap items-center gap-x-3 gap-y-1">
            <span>© 2026 Better Oriental Mindoro</span>
            <span aria-hidden="true" className="text-white/30">|</span>
            <Link href="https://github.com/renthelautomations/betterorientalmindoro/blob/main/LICENSE" {...ext} className="hover:underline">MIT</Link>
            <span aria-hidden="true" className="text-white/30">|</span>
            <span>Public data is cited to its source on each page.</span>
          </p>
          <p className="flex items-center gap-x-6">
            <a href="https://github.com/renthelautomations" {...ext} className="inline-flex items-center gap-1.5 hover:text-white">
              <Icon name="heart" className="h-3.5 w-3.5" />
              Built by <b className="font-semibold text-white">Renthel Cueto</b>
            </a>
            <a href={`${SITE.github}/commits/main`} {...ext} className="inline-flex items-center gap-1.5 text-white/60 hover:text-white">
              <Icon name="gear" className="h-3.5 w-3.5" />
              Ver. {pkg.version}
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
