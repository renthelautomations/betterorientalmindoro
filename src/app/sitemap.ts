import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { getMunicipalities } from "@/lib/municipalities";
import { getProvince } from "@/lib/dynasties";
import { getServices } from "@/lib/services";
import { ICON_KEYS } from "@/lib/brand";
import { getProjects } from "@/lib/projects";
import { getEo, getReports } from "@/lib/gov";
import { getDocs, projectSlugs } from "@/lib/gov-proc-data";

const BASE = siteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "", "/bayan", "/hotlines", "/proyekto", "/estatistika", "/badyet", "/badyet/1st", "/badyet/2nd", "/badyet/redflags", "/terms", "/privacy", "/accessibility", "/faq",
    ...ICON_KEYS.map((k) => `/${k}`),
    ...getMunicipalities().map((m) => `/bayan/${m.slug}`),
    "/pamahalaan", "/pamahalaan/mga-tala", ...getEo().items.map((e) => `/pamahalaan/eo/${e.id}`), ...getReports().items.map((r) => `/pamahalaan/ulat/${r.id}`), ...projectSlugs().map((r) => `/pamahalaan/bidding/${r}`), ...getDocs().map((d) => `/pamahalaan/dokumento/${d.id}`),
    "/dynasties", ...getProvince().towns.map((t) => `/dynasties/${t}`),
    "/serbisyo", ...getServices().map((s) => `/serbisyo/${s.category}/${s.id}`),
    ...getProjects().map((p) => `/proyekto/${p.id}`),
  ];
  return paths.map((p) => ({ url: BASE + p }));
}
