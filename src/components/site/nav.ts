import type { NavLink } from "@/components/kit/Layout";

import { GROUPS } from "@/lib/ia";

// Footer "Explore": the six groups of src/lib/ia.ts. Each group landing opens its own detail pages.
export const NAV: NavLink[] = GROUPS.map((g) => ({ label: g.label, href: g.landing }));

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

export type MenuItem = { label: string; href: string; desc?: string; n: number };
export type NavEntry = { label: string; short?: string; href?: string; match: string[]; menu?: { items: MenuItem[]; cols: 3 | 4 | 5; all?: { label: string; href: string } } };

/** Header entries: one per group of src/lib/ia.ts, each with a mega menu. Towns and service categories are filled in from the data. Built on the server and passed to the client header. */
export function buildMenu(serviceSlugs: string[], towns: { slug: string; name: string }[]): NavEntry[] {
  let n = 0;
  const it = (label: string, href: string, desc?: string): MenuItem => ({ label, href, desc, n: n++ });
  const COLS: Record<string, 3 | 4 | 5> = { culture: 5, towns: 5, services: 3, officials: 3, money: 3, records: 3 };
  return GROUPS.map((g) => {
    let items = g.items;
    if (g.id === "towns") items = [...towns.map((t) => ({ label: t.name, href: `/bayan/${t.slug}` })), ...g.items.filter((i) => i.href !== "/bayan")];
    if (g.id === "services") items = [{ label: "nav.hotlines", href: "/hotlines", desc: "menu.hot.d" }, ...serviceSlugs.map((slug) => ({ label: `svc.cat.${slug}`, href: `/serbisyo#${slug}`, desc: `svc.cat.${slug}.b` }))];
    const all = g.id === "towns" ? { label: "menu.towns.all", href: "/bayan" } : g.id === "services" ? { label: "menu.all.svc", href: "/serbisyo" } : g.id === "culture" ? { label: "menu.all.mht", href: "/mahaltana" } : g.id === "records" ? { label: "menu.all.gov", href: "/pamahalaan" } : undefined;
    return { label: g.label, short: g.nav, href: g.landing, match: g.match, menu: { cols: COLS[g.id], all, items: items.map((i) => it(i.label, i.href, i.desc)) } };
  });
}
