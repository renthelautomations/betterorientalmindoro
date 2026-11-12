import { getMunicipalities } from "./municipalities";
import { getServices } from "./services";
import { getHotlines } from "./hotlines";
import { FAQ_EN, FAQ_FIL } from "./faq";
import { STORIES_EN } from "./stories";
import { getDistricts } from "./badyet";
import { getStats, fmtInt } from "./stats";
import type { SearchItem, SearchScope } from "./smart-search";

export type { SearchItem };
const tel = (n: string) => "tel:" + n.replace(/[^\d+]/g, "");

// Section pages: title follows the language toggle (tk); kw holds the words people use for them in both languages.
const PAGES: { tk: string; href: string; kw: string; pop?: boolean }[] = [
  { tk: "nav.towns", href: "/bayan", kw: "bayan towns municipalities lungsod mapa map" },
  { tk: "nav.services", href: "/serbisyo", kw: "serbisyo services government permit sertipiko tulong", pop: true },
  { tk: "nav.hotlines", href: "/hotlines", kw: "hotline tawag numero emergency telepono pulis bumbero ambulansya", pop: true },
  { tk: "nav.projects", href: "/proyekto", kw: "proyekto projects dpwh kalsada road tulay bridge gusali", pop: true },
  { tk: "nav.stats", href: "/estatistika", kw: "estatistika statistics populasyon population datos data" },
  { tk: "nav.budget", href: "/badyet", kw: "badyet budget nep pondo gastos house bills", pop: true },
  { tk: "nav.transparency", href: "/transparency", kw: "transparency buwis tax bir collection philgeps procurement kontrata contracts awardee supplier pagbili bidding" },
  { tk: "rf.cta", href: "/badyet/redflags", kw: "red flag redflags badyet budget 2027 house bill nep pbc people budget coalition proyekto dpwh farm to market road iregularidad suriin" },
  { tk: "nav.dynasties", href: "/dynasties", kw: "dinastiya dynasties pamilya apelyido surname halalan election pulitika" },
  { tk: "nav.gov", href: "/pamahalaan", kw: "pamahalaan government officials offices executive orders bids jobs careers investment opisyal opisina trabaho mamuhunan", pop: true },
  { tk: "gov.tab.jobs", href: "/pamahalaan#trabaho", kw: "jobs careers vacancies hiring trabaho bakante aplikasyon pamahalaan" },
  { tk: "gov.tab.invest", href: "/pamahalaan#mamuhunan", kw: "invest investment business sectors mamuhunan pamumuhunan negosyo" },
  { tk: "nav.faq", href: "/faq", kw: "faq tanong questions help tulong" },
  { tk: "nav.terms", href: "/terms", kw: "terms tuntunin kondisyon" },
  { tk: "nav.privacy", href: "/privacy", kw: "privacy pribasiya data" },
  { tk: "nav.access", href: "/accessibility", kw: "accessibility pagiging-accessible" },
];
const STORY_ROUTE = { ma: "/ma", hal: "/hal", ta: "/ta", na: "/na" } as const;
const POPULAR_SERVICE = /birth certificate|nbi|ambulance|scholarship|burial/i;

/** One static list for the site search: towns, services, hotlines, section pages, the four stories and the FAQ. */
export function getSearchItems(scope: SearchScope = "all"): SearchItem[] {
  if (scope !== "all") return scopedItems(scope);
  return [
    ...PAGES.map((p) => ({ type: "pahina" as const, title: p.tk, tk: p.tk, href: p.href, kw: p.kw, pop: p.pop })),
    ...getMunicipalities().map((m) => ({ type: "bayan" as const, title: m.name, sub: m.isCity ? "Lungsod" : "Bayan", href: `/bayan/${m.slug}`, kw: "town bayan city lungsod municipality" })),
    ...getServices().map((s) => ({ type: "serbisyo" as const, title: s.title, sub: s.summary, href: `/serbisyo/${s.category}/${s.id}`, pop: POPULAR_SERVICE.test(s.title) })),
    ...getHotlines().map((h) => ({ type: "hotline" as const, title: h.name, sub: h.number, href: tel(h.number), kw: h.category, pop: h.confirmed && /^(Police|Fire)$/.test(h.name) })),
    ...(Object.entries(STORY_ROUTE) as [keyof typeof STORY_ROUTE, string][]).map(([k, href]) => ({ type: "kwento" as const, title: STORIES_EN[k].title, href, kw: "story kwento mahaltana" })),
    ...FAQ_FIL.map((f, i) => ({ type: "faq" as const, title: f.q, href: "/faq", kw: FAQ_EN[i]?.q })),
  ];
}

const BIG = new Set(["calapan-city", "puerto-galera", "naujan", "pinamalayan", "roxas"]);
/** Only what belongs on that page: services on /serbisyo, towns on /bayan and /estatistika, districts and offices on /badyet. */
function scopedItems(scope: Exclude<SearchScope, "all">): SearchItem[] {
  if (scope === "serbisyo") return getServices().map((s) => ({ type: "serbisyo" as const, title: s.title, sub: s.summary, href: `/serbisyo/${s.category}/${s.id}`, kw: s.category, pop: POPULAR_SERVICE.test(s.title) }));
  if (scope === "badyet")
    return getDistricts().flatMap((d) => [
      { type: "pahina" as const, title: d.label, sub: `${d.representative.name} · ${d.representative.seat}`, href: `/badyet/${d.id}`, kw: `district distrito ${d.representative.name}`, pop: true },
      ...d.offices.map((o) => ({ type: "pahina" as const, title: o.name, sub: d.label, href: `/badyet/${d.id}`, kw: `${o.kind_label} office opisina dpwh school paaralan` })),
    ]);
  const withStat = scope === "estatistika";
  return getMunicipalities().map((m) => {
    const pop = getStats(m.slug)?.population.at(-1)?.value;
    return { type: "bayan" as const, title: m.name, sub: withStat && pop != null ? `${fmtInt(pop)} · ${Math.round(m.areaKm2)} km²` : m.isCity ? "Lungsod" : "Bayan", href: withStat ? `/bayan/${m.slug}#estatistika` : `/bayan/${m.slug}`, kw: "town bayan city lungsod municipality", pop: BIG.has(m.slug) };
  });
}
