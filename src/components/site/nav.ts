import type { NavLink } from "@/components/kit/Layout";

// Four top-level doors. Add a hub here, not a seventh link.
export const NAV: NavLink[] = [
  { label: "MaHalTaNa", href: "/mahaltana" },
  { label: "Bayan", href: "/bayan" },
  { label: "Serbisyo", href: "/serbisyo" },
  { label: "Datos", href: "/datos" },
];

export const FOOTER_LINKS: NavLink[] = [
  { label: "Hotlines", href: "/hotlines" },
  { label: "Terms of Use", href: "/terms" },
  { label: "Privacy Policy", href: "/privacy" },
  { label: "Accessibility", href: "/accessibility" },
  { label: "FAQ", href: "/faq" },
];

export const FOOTER_SOURCES: NavLink[] = [
  { label: "BetterGov Open Data", href: "https://data.bettergov.ph" },
  { label: "BetterGov Budget", href: "https://budget.bettergov.ph" },
  { label: "Dynasties by BetterGov", href: "https://dynasties.bettergov.ph" },
  { label: "Open Halalan", href: "https://robertrleung.github.io/OpenHalalan/" },
];
