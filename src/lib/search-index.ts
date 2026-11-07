import type { SearchItem } from "@/components/kit/SiteSearch";
import { getMunicipalities } from "./municipalities";
import { getServices } from "./services";
import { getHotlines } from "./hotlines";

const tel = (n: string) => "tel:" + n.replace(/[^\d+]/g, "");

/** One static list for the site search: every bayan, service and hotline. */
export function getSearchItems(): SearchItem[] {
  return [
    ...getMunicipalities().map((m) => ({ type: "bayan" as const, title: m.name, sub: m.isCity ? "Lungsod" : "Bayan", href: `/bayan/${m.slug}` })),
    ...getServices().map((s) => ({ type: "serbisyo" as const, title: s.title, sub: s.summary, href: `/serbisyo/${s.category}/${s.id}` })),
    ...getHotlines().map((h) => ({ type: "hotline" as const, title: h.name, sub: h.number, href: tel(h.number) })),
  ];
}
