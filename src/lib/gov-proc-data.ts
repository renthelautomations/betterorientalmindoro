// Server-side getters over the committed procurement JSON. Built once per process.
import procurementJson from "@/data/gov/procurement.json";
import docsJson from "@/data/gov/procurement-docs.json";
import projectsJson from "@/data/gov/projects.json";
import flagsJson from "@/data/gov/flags.json";
import type { Flag } from "./gov-flags";
import { cleanTitle } from "./projects";
import { getMunicipality } from "./municipalities";
import { buildCards, flagCounts, isShouting, mergeDocs, plainTitle, slugRef, sortDocs, type Card, type DocView, type Extracted, type Listed } from "./gov-proc";

let cache: { docs: DocView[]; cards: Card[]; byId: Map<string, DocView>; bySlug: Map<string, Card>; flags: Flag[] } | null = null;
function load() {
  if (cache) return cache;
  const docs = mergeDocs(procurementJson.items as Listed[], docsJson.items as unknown as Extracted[]);
  const flags = flagsJson.flags as unknown as Flag[];
  const cards = buildCards(docs, flagCounts(flags), (s) => getMunicipality(s)?.name, (ds) => {
    const t = plainTitle((ds.find((d) => d.type === "itb") ?? ds[0]).title);
    return isShouting(t) ? cleanTitle(t) : t;
  });
  cache = { docs, cards, byId: new Map(docs.map((d) => [d.id, d])), bySlug: new Map(cards.map((c) => [c.slug, c])), flags };
  return cache;
}
export const getDocs = () => load().docs;
export const getDoc = (id: string) => load().byId.get(id);
export const getCards = () => load().cards;
export const getCard = (slug: string) => load().bySlug.get(slug);
export const getAllFlags = () => load().flags;
export const flagsExtractedAt = () => flagsJson.extractedAt as string;
export const docsOfProject = (refNo: string) => sortDocs(load().docs.filter((d) => d.refNo === refNo));
/** Project refNos from projects.json plus any refNo only seen in the listing. */
export const projectSlugs = () => [...new Set([...(projectsJson.projects as { refNo: string }[]).map((p) => slugRef(p.refNo)), ...load().cards.map((c) => c.slug)])].filter((s) => load().bySlug.has(s));
export function neighbours(id: string) {
  const d = load().byId.get(id);
  if (!d?.refNo) return { prev: null, next: null };
  const ds = docsOfProject(d.refNo), i = ds.findIndex((x) => x.id === id);
  return { prev: ds[i - 1] ?? null, next: ds[i + 1] ?? null };
}
