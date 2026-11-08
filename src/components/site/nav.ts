import type { NavLink } from "@/components/kit/Layout";
import { FIESTA, FIESTA_DEEP } from "@/components/kit/Patterns";
import { CATEGORY_ICON, lookOf } from "./ServiceTile";

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
  { label: "nav.gov", href: "/pamahalaan" },
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

export type MenuItem = { label: string; href: string; desc?: string; icon?: string; art?: "halcon" | "tamaraw" | "lake" | "letters"; letters?: string; color: string; pattern: string };
export type NavEntry = { label: string; href?: string; match: string[]; menu?: { items: MenuItem[]; cols: 3 | 4; all?: { label: string; href: string } } };

/** Header entries: five groups with a mega menu (MaHalTaNa, Services, Data, Government) or a plain link. Built on the server and passed to the client header. */
export function buildMenu(serviceSlugs: string[]): NavEntry[] {
  const it = (label: string, href: string, color: string, pattern: string, extra: Partial<MenuItem> = {}): MenuItem => ({ label, href, color, pattern, ...extra });
  return [
    { label: "MaHalTaNa", href: "/mahaltana", match: ["/mahaltana", "/ma", "/hal", "/ta", "/na"], menu: { cols: 4, all: { label: "menu.all.mht", href: "/mahaltana" }, items: [
      it("Mangyan", "/ma", FIESTA.blue, "dotblocks", { art: "letters", letters: "Ma", desc: "home.pillar.ma" }),
      it("Mount Halcon", "/hal", FIESTA_DEEP.green, "peaks", { art: "halcon", desc: "home.pillar.hal" }),
      it("Tamaraw", "/ta", FIESTA.red, "horns", { art: "tamaraw", desc: "home.pillar.ta" }),
      it("Naujan Lake", "/na", FIESTA_DEEP.sky, "wave", { art: "lake", desc: "home.pillar.na" }),
    ] } },
    { label: "nav.towns", href: "/bayan", match: ["/bayan"] },
    { label: "nav.services", href: "/serbisyo", match: ["/serbisyo"], menu: { cols: 3, all: { label: "menu.all.svc", href: "/serbisyo" }, items: serviceSlugs.map((slug) => {
      const look = lookOf(slug);
      return it(`svc.cat.${slug}`, `/serbisyo#${slug}`, look.color, look.pattern, { icon: CATEGORY_ICON[slug] ?? "doc", desc: `svc.cat.${slug}.b` });
    }) } },
    { label: "nav.hotlines", href: "/hotlines", match: ["/hotlines"] },
    { label: "nav.data", match: ["/proyekto", "/estatistika", "/badyet", "/dynasties"], menu: { cols: 4, items: [
      it("nav.projects", "/proyekto", FIESTA_DEEP.green, "peaks", { icon: "road", desc: "menu.data.proyekto.d" }),
      it("nav.stats", "/estatistika", FIESTA.blue, "mosaic", { icon: "people", desc: "menu.data.estat.d" }),
      it("nav.budget", "/badyet", FIESTA_DEEP.orange, "burst", { icon: "budget", desc: "menu.data.badyet.d" }),
      it("nav.dynasties", "/dynasties", FIESTA.navy, "dotblocks", { icon: "calendar", desc: "menu.data.dyn.d" }),
    ] } },
    { label: "nav.gov", href: "/pamahalaan", match: ["/pamahalaan"], menu: { cols: 3, all: { label: "menu.all.gov", href: "/pamahalaan" }, items: [
      it("gov.tab.officials", "/pamahalaan#opisyal", FIESTA.blue, "mosaic", { icon: "people", desc: "menu.gov.opisyal.d" }),
      it("gov.tab.eo", "/pamahalaan#eo", FIESTA.navy, "dotblocks", { icon: "doc", desc: "menu.gov.eo.d" }),
      it("gov.tab.bids", "/pamahalaan#bidding", FIESTA_DEEP.orange, "burst", { icon: "shield", desc: "menu.gov.bidding.d" }),
      it("gov.tab.reports", "/pamahalaan#ulat", FIESTA_DEEP.green, "peaks", { icon: "budget", desc: "menu.gov.ulat.d" }),
      it("gov.tab.jobs", "/pamahalaan#trabaho", FIESTA.red, "horns", { icon: "school", desc: "menu.gov.trabaho.d" }),
      it("gov.tab.invest", "/pamahalaan#mamuhunan", FIESTA_DEEP.sky, "wave", { icon: "mountain", desc: "menu.gov.mamuhunan.d" }),
    ] } },
  ];
}
