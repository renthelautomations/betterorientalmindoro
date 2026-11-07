import type { MetadataRoute } from "next";
import { siteUrl } from "@/lib/site-url";
import { getMunicipalities } from "@/lib/municipalities";
import { getProvince } from "@/lib/dynasties";
import { getServices } from "@/lib/services";
import { ICON_KEYS } from "@/lib/brand";
import { getProjects } from "@/lib/projects";

const BASE = siteUrl();

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = [
    "", "/bayan", "/hotlines", "/proyekto", "/estatistika", "/badyet", "/terms", "/privacy", "/accessibility", "/faq",
    ...ICON_KEYS.map((k) => `/${k}`),
    ...getMunicipalities().map((m) => `/bayan/${m.slug}`),
    ...getMunicipalities().flatMap((m) => ["tulong", "proyekto", "halalan", "datos"].map((t) => `/bayan/${m.slug}/${t}`)),
    "/dynasties", ...getProvince().towns.map((t) => `/dynasties/${t}`),
    "/serbisyo", ...getServices().map((s) => `/serbisyo/${s.category}/${s.id}`),
    ...getProjects().map((p) => `/proyekto/${p.id}`),
  ];
  return paths.map((p) => ({ url: BASE + p }));
}
