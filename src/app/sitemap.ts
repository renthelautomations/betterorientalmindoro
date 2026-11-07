import type { MetadataRoute } from "next";
import { getMunicipalities } from "@/lib/municipalities";
import { getCategories, getServices } from "@/lib/services";
import { ICON_KEYS } from "@/lib/brand";

const BASE = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export default function sitemap(): MetadataRoute.Sitemap {
  const paths = ["", "/bayan", "/hotlines", "/serbisyo", ...getCategories().map((c) => `/serbisyo/${c.slug}`), ...getServices().map((s) => `/serbisyo/${s.category}/${s.id}`), "/proyekto", "/terms", "/privacy", "/accessibility", "/faq", ...ICON_KEYS.map((k) => `/${k}`), ...getMunicipalities().map((m) => `/bayan/${m.slug}`)];
  return paths.map((p) => ({ url: BASE + p }));
}
