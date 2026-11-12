import data from "@/data/laws.json";

export type Law = { id: string; kind: string; ref: string; year: number; title: string; town: string | null; url: string };
export const LAWS_SOURCE = { source: data.source, sourceUrl: data.sourceUrl, fetchedAt: data.fetchedAt };
export const getLaws = (): Law[] => data.items as Law[];
