import { getMunicipalities } from "./municipalities";
import { getServices } from "./services";
import { getHotlines } from "./hotlines";
import { FAQ_EN, FAQ_FIL } from "./faq";
import { STORIES_EN } from "./stories";
import type { SearchItem } from "./smart-search";

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
  { tk: "nav.dynasties", href: "/dynasties", kw: "dinastiya dynasties pamilya apelyido surname halalan election pulitika" },
  { tk: "nav.faq", href: "/faq", kw: "faq tanong questions help tulong" },
  { tk: "nav.terms", href: "/terms", kw: "terms tuntunin kondisyon" },
  { tk: "nav.privacy", href: "/privacy", kw: "privacy pribasiya data" },
  { tk: "nav.access", href: "/accessibility", kw: "accessibility pagiging-accessible" },
];
const STORY_ROUTE = { ma: "/ma", hal: "/hal", ta: "/ta", na: "/na" } as const;
const POPULAR_SERVICE = /birth certificate|nbi|ambulance|scholarship|burial/i;

/** One static list for the site search: towns, services, hotlines, section pages, the four stories and the FAQ. */
export function getSearchItems(): SearchItem[] {
  return [
    ...PAGES.map((p) => ({ type: "pahina" as const, title: p.tk, tk: p.tk, href: p.href, kw: p.kw, pop: p.pop })),
    ...getMunicipalities().map((m) => ({ type: "bayan" as const, title: m.name, sub: m.isCity ? "Lungsod" : "Bayan", href: `/bayan/${m.slug}`, kw: "town bayan city lungsod municipality" })),
    ...getServices().map((s) => ({ type: "serbisyo" as const, title: s.title, sub: s.summary, href: `/serbisyo/${s.category}/${s.id}`, pop: POPULAR_SERVICE.test(s.title) })),
    ...getHotlines().map((h) => ({ type: "hotline" as const, title: h.name, sub: h.number, href: tel(h.number), kw: h.category, pop: h.confirmed && /^(Police|Fire)$/.test(h.name) })),
    ...(Object.entries(STORY_ROUTE) as [keyof typeof STORY_ROUTE, string][]).map(([k, href]) => ({ type: "kwento" as const, title: STORIES_EN[k].title, href, kw: "story kwento mahaltana" })),
    ...FAQ_FIL.map((f, i) => ({ type: "faq" as const, title: f.q, href: "/faq", kw: FAQ_EN[i]?.q })),
  ];
}
