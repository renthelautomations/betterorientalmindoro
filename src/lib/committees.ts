import pin from "@/data/lgu-committees/pinamalayan.json";

export type Member = { name: string; committees: string[] };
export type Committees = { source: string; fetchedAt: string; members: Member[] };
const all: Record<string, Committees> = { pinamalayan: pin as Committees };

/** Sangguniang Bayan committee assignments as the town's own site lists them. Undefined for towns we have not read. */
export const getCommittees = (slug: string): Committees | undefined => all[slug];
