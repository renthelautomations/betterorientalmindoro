import { notFound } from "next/navigation";
import { getMunicipalities, getMunicipality } from "@/lib/municipalities";
import { getProjects } from "@/lib/projects";

export const bayanParams = () => getMunicipalities().map((m) => ({ slug: m.slug }));

export function requireBayan(slug: string) {
  const m = getMunicipality(slug);
  if (!m) notFound();
  return m;
}

/** Projects assigned to this bayan (uncertain rows carry no municipality), largest cost first. */
export const topProjects = (slug: string) => [...getProjects(slug)].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0));
export const peso = (n?: number) => (n ? `₱${Math.round(n).toLocaleString("en-PH")}` : "-");
