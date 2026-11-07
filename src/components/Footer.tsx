import Link from "next/link";
import Logo from "./Logo";
import { SITE } from "@/lib/brand";

const LINKS = [
  { href: "/sitemap.xml", label: "Sitemap" },
  { href: "/terms", label: "Terms of Use" },
  { href: "/privacy", label: "Privacy Policy" },
  { href: "/accessibility", label: "Accessibility" },
  { href: "/faq", label: "FAQ" },
];

export default function Footer() {
  return (
    <footer className="mt-auto bg-[#1b2a4a] text-white/80">
      <div className="mx-auto grid max-w-6xl gap-10 px-4 py-12 md:grid-cols-[2fr_1fr] md:gap-16">
        <div>
          <Logo tone="light" />
          <p className="mt-6 font-semibold text-white">{SITE.tagline}</p>
          <p className="mt-2 max-w-xl text-sm leading-relaxed">
            This website is a volunteer-led civic website under BetterGov.PH initiative. Not affiliated with or
            representing the Oriental Mindoro provincial government or any LGU. 100% free, volunteer-run and community-based.
          </p>
          <p className="mt-4 text-sm font-semibold text-white">Cost to the People of Oriental Mindoro: ₱0</p>
          <a href={SITE.github} className="mt-4 inline-block py-2 text-sm underline" rel="noopener">GitHub</a>
        </div>
        <nav aria-label="Quick links">
          <h2 className="font-semibold text-white">Quick Links</h2>
          <ul className="mt-3 text-sm">
            {LINKS.map((l) => (
              <li key={l.href}><Link href={l.href} className="inline-block py-1 hover:underline">{l.label}</Link></li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="border-t border-white/10 px-4 py-6 text-center text-xs">
        2026 Better Oriental Mindoro. MIT License. Public data is cited to its source on each page.
      </p>
    </footer>
  );
}
