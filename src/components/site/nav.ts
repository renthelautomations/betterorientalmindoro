import type { NavLink } from "@/components/kit/Layout";

// One main page per section. Each record opens its own detail page.
export const NAV: NavLink[] = [
  { label: "MaHalTaNa", href: "/mahaltana" },
  { label: "nav.towns", href: "/bayan" },
  { label: "nav.services", href: "/serbisyo" },
  { label: "nav.hotlines", href: "/hotlines" },
  { label: "nav.projects", href: "/proyekto" },
  { label: "nav.stats", href: "/estatistika" },
  { label: "nav.budget", href: "/badyet" },
  { label: "nav.dynasties", href: "/dynasties" },
];

export const FOOTER_LINKS: NavLink[] = [
  { label: "nav.terms", href: "/terms" },
  { label: "nav.privacy", href: "/privacy" },
  { label: "nav.access", href: "/accessibility" },
  { label: "nav.faq", href: "/faq" },
];

export const FOOTER_SOURCES: NavLink[] = [
  { label: "BetterGov Open Data", href: "https://data.bettergov.ph" },
  { label: "BetterGov Budget", href: "https://budget.bettergov.ph" },
  { label: "Dynasties by BetterGov", href: "https://dynasties.bettergov.ph" },
  { label: "Open Halalan", href: "https://robertrleung.github.io/OpenHalalan/" },
];
