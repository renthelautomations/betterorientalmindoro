import data from "@/data/dpwh.json";

export type Project = { id: string; title: string; municipality?: string; cost?: number; status?: string; year?: number; category?: string };

const all = data as Project[];

export const getProjects = (slug?: string): Project[] => (slug ? all.filter((p) => p.municipality === slug) : all);

export const getProjectStats = () => ({ total: all.length, assigned: all.filter((p) => p.municipality).length });
