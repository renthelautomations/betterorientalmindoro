// The one list of what is on the site. The header menus, the footer, the "more in this section" strip and the coverage test all read it.
// Add a page here or the test in ia.test.ts fails: that is how no section gets lost.
export type IaItem = { label: string; href: string; desc?: string };
export type IaGroup = { id: string; label: string; nav?: string; landing: string; match: string[]; items: IaItem[] };

export const GROUPS: IaGroup[] = [
  { id: "culture", label: "MaHalTaNa", landing: "/mahaltana", match: ["/mahaltana", "/ma", "/hal", "/ta", "/na"], items: [
    { label: "Mangyan", href: "/ma", desc: "home.pillar.ma" },
    { label: "Mount Halcon", href: "/hal", desc: "home.pillar.hal" },
    { label: "Tamaraw", href: "/ta", desc: "home.pillar.ta" },
    { label: "Naujan Lake", href: "/na", desc: "home.pillar.na" },
    { label: "menu.hist", href: "/#kasaysayan", desc: "menu.hist.d" },
  ] },
  { id: "towns", label: "nav.towns", landing: "/bayan", match: ["/bayan", "/barangay", "/estatistika"], items: [
    { label: "menu.towns.all", href: "/bayan", desc: "menu.towns.all.d" },
    { label: "menu.off.brgy", href: "/barangay", desc: "menu.off.brgy.d" },
    { label: "nav.stats", href: "/estatistika", desc: "menu.data.estat.d" },
  ] },
  { id: "services", label: "nav.services", landing: "/serbisyo", match: ["/serbisyo", "/hotlines"], items: [
    { label: "nav.services", href: "/serbisyo", desc: "menu.svc.d" },
    { label: "nav.hotlines", href: "/hotlines", desc: "menu.hot.d" },
  ] },
  { id: "officials", label: "ia.officials", nav: "ia.officials.nav", landing: "/mga-opisyal", match: ["/mga-opisyal", "/dynasties"], items: [
    { label: "menu.off.prov", href: "/mga-opisyal#of-prov", desc: "menu.off.prov.d" },
    { label: "menu.off.town", href: "/mga-opisyal#of-towns", desc: "menu.off.town.d" },
    { label: "menu.off.brgy", href: "/barangay", desc: "menu.off.brgy.off.d" },
    { label: "menu.off.provoff", href: "/pamahalaan#opisyal", desc: "menu.off.provoff.d" },
    { label: "menu.off.townoff", href: "/bayan", desc: "menu.off.townoff.d" },
    { label: "nav.dynasties", href: "/dynasties", desc: "menu.data.dyn.d" },
  ] },
  { id: "money", label: "ia.money", nav: "ia.money.nav", landing: "/proyekto", match: ["/proyekto", "/badyet", "/transparency", "/pamahalaan/bidding", "/pamahalaan/ulat", "/pamahalaan/mga-tala"], items: [
    { label: "nav.projects", href: "/proyekto", desc: "menu.data.proyekto.d" },
    { label: "nav.budget", href: "/badyet", desc: "menu.data.badyet.d" },
    { label: "menu.all.redflags", href: "/badyet/redflags", desc: "menu.data.rf.d" },
    { label: "gov.tab.bids", href: "/pamahalaan#bidding", desc: "menu.gov.bidding.d" },
    { label: "gov.tab.reports", href: "/pamahalaan#ulat", desc: "menu.gov.ulat.d" },
    { label: "nav.transparency", href: "/transparency", desc: "menu.data.tp.d" },
    { label: "tp.tab.proc", href: "/transparency/kontrata", desc: "menu.money.contracts.d" },
    { label: "govb.notes.title", href: "/pamahalaan/mga-tala", desc: "menu.money.notes.d" },
  ] },
  { id: "records", label: "ia.records", nav: "ia.records.nav", landing: "/pamahalaan", match: ["/pamahalaan", "/batas"], items: [
    { label: "menu.law", href: "/batas", desc: "menu.law.d" },
    { label: "gov.tab.eo", href: "/pamahalaan#eo", desc: "menu.gov.eo.d" },
    { label: "gov.tab.jobs", href: "/pamahalaan#trabaho", desc: "menu.gov.trabaho.d" },
    { label: "gov.tab.invest", href: "/pamahalaan#mamuhunan", desc: "menu.gov.mamuhunan.d" },
    { label: "menu.rec.all", href: "/pamahalaan", desc: "menu.rec.all.d" },
  ] },
];

/** Pages that live outside the groups on purpose: footer pages. */
export const OUTSIDE = ["/", "/terms", "/privacy", "/accessibility", "/faq"];

/** The group a path belongs to: longest matching prefix wins, so /pamahalaan/bidding goes to money while /pamahalaan stays in records. */
export function groupOf(path: string): IaGroup | undefined {
  let best: { g: IaGroup; n: number } | undefined;
  for (const g of GROUPS) for (const m of g.match) if ((path === m || path.startsWith(m + "/")) && (!best || m.length > best.n)) best = { g, n: m.length };
  return best?.g;
}
