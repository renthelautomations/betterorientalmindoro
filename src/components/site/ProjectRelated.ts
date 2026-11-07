import type { Project } from "@/lib/projects";

/** Up to n other projects, same town and category first, then same town, then same category; biggest published budget first within a tier. */
export function relatedProjects(all: Project[], p: Project, n = 4): Project[] {
  const tier = (q: Project) => {
    const town = p.municipality != null && q.municipality === p.municipality;
    const cat = p.category != null && q.category === p.category;
    return town && cat ? 0 : town ? 1 : cat ? 2 : 3;
  };
  return all
    .filter((q) => q.id !== p.id && tier(q) < 3)
    .sort((a, b) => tier(a) - tier(b) || (b.cost ?? 0) - (a.cost ?? 0))
    .slice(0, n);
}
