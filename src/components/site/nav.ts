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

export type MenuItem = { label: string; href: string; desc?: string; n: number };
export type NavEntry = { label: string; href?: string; match: string[]; menu?: { items: MenuItem[]; cols: 3 | 4 | 5; all?: { label: string; href: string } } };

/** Header entries: five groups with a mega menu (MaHalTaNa, Services, Data, Government) or a plain link. Built on the server and passed to the client header. */
export function buildMenu(serviceSlugs: string[]): NavEntry[] {
  let n = 0;
  const it = (label: string, href: string, desc?: string): MenuItem => ({ label, href, desc, n: n++ });
  return [
    { label: "MaHalTaNa", href: "/mahaltana", match: ["/mahaltana", "/ma", "/hal", "/ta", "/na"], menu: { cols: 4, all: { label: "menu.all.mht", href: "/mahaltana" }, items: [
      it("Mangyan", "/ma", "home.pillar.ma"),
      it("Mount Halcon", "/hal", "home.pillar.hal"),
      it("Tamaraw", "/ta", "home.pillar.ta"),
      it("Naujan Lake", "/na", "home.pillar.na"),
    ] } },
    { label: "nav.towns", href: "/bayan", match: ["/bayan"] },
    { label: "nav.services", href: "/serbisyo", match: ["/serbisyo"], menu: { cols: 3, all: { label: "menu.all.svc", href: "/serbisyo" }, items: serviceSlugs.map((slug) => it(`svc.cat.${slug}`, `/serbisyo#${slug}`, `svc.cat.${slug}.b`)) } },
    { label: "nav.hotlines", href: "/hotlines", match: ["/hotlines"] },
    { label: "nav.data", match: ["/proyekto", "/estatistika", "/badyet", "/dynasties", "/transparency", "/batas"], menu: { cols: 3, items: [
      it("nav.projects", "/proyekto", "menu.data.proyekto.d"),
      it("nav.stats", "/estatistika", "menu.data.estat.d"),
      it("nav.dynasties", "/dynasties", "menu.data.dyn.d"),
      it("nav.budget", "/badyet", "menu.data.badyet.d"),
      it("menu.all.redflags", "/badyet/redflags", "menu.data.rf.d"),
      it("nav.transparency", "/transparency", "menu.data.tp.d"),
      it("menu.law", "/batas", "menu.law.d"),
    ] } },
    { label: "nav.gov", href: "/pamahalaan", match: ["/pamahalaan", "/mga-opisyal", "/barangay"], menu: { cols: 4, all: { label: "menu.all.gov", href: "/pamahalaan" }, items: [
      it("menu.off.prov", "/mga-opisyal#of-prov", "menu.off.prov.d"),
      it("menu.off.provoff", "/pamahalaan#opisyal", "menu.off.provoff.d"),
      it("menu.off.town", "/mga-opisyal#of-towns", "menu.off.town.d"),
      it("menu.off.townoff", "/bayan", "menu.off.townoff.d"),
      it("menu.off.brgy", "/barangay", "menu.off.brgy.d"),
      it("gov.tab.eo", "/pamahalaan#eo", "menu.gov.eo.d"),
      it("gov.tab.bids", "/pamahalaan#bidding", "menu.gov.bidding.d"),
      it("gov.tab.reports", "/pamahalaan#ulat", "menu.gov.ulat.d"),
      it("gov.tab.jobs", "/pamahalaan#trabaho", "menu.gov.trabaho.d"),
      it("gov.tab.invest", "/pamahalaan#mamuhunan", "menu.gov.mamuhunan.d"),
    ] } },
  ];
}
