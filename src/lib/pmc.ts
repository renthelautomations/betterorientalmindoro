import pin from "@/data/lgu-pmc/pinamalayan.json";

export type Inspection = { date: string | null; progress: number | null; state: "completed" | "ongoing" | "other"; withFindings: boolean; findings: string[]; recommendation: string[]; url: string };
export type PhilgepsMatch = { awardRef: string; awardDate: string | null; awardee: string; amount: number; title: string | null; nameMatch: boolean; amountMatch: boolean };
export type BidDoc = { url: string; title: string; kind: string };
export type PmcProject = { project: string; contractor: string | null; cost: number; fund: string | null; barangays: string[]; inspections: Inspection[]; philgeps: PhilgepsMatch[]; bidDocs: BidDoc[] };
export type PmcFlag = { type: "claim100" | "longrun" | "billboard" | "nwrb" | "unfinished" | "defects"; evidence: { project: string; date: string | null; url: string; page: number | null }[]; quote?: string[]; denyFinalPayment?: boolean; visits?: number; first?: string; last?: string; progress?: number[]; project?: string; projects?: number; cost?: number; withFindings?: number };
export type Pmc = {
  flags: PmcFlag[]; source: string; fetchedAt: string; documents: { url: string; label: string; ok: boolean }[]; projects: PmcProject[] };

const all: Record<string, Pmc> = { pinamalayan: pin as unknown as Pmc };

/** Project Monitoring Committee inspection reports as the town's own site publishes them, read by OCR. Undefined for towns we have not read. */
export const getPmc = (slug: string): Pmc | undefined => all[slug];
export const pmcForBarangay = (slug: string, pcode: string): PmcProject[] => getPmc(slug)?.projects.filter((p) => p.barangays.includes(pcode)) ?? [];
export const lastInspection = (p: PmcProject): Inspection => p.inspections.at(-1)!;
