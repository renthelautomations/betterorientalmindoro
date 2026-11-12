import pin from "@/data/barangay-officials/pinamalayan.json";

export type BrgyOfficial = { position: string; name: string };
export type BrgyOfficials = { site: string; officials: BrgyOfficial[]; email: string | null; fetchedAt: string; source: string };

type Row = { site: string; pcode: string | null; officials: BrgyOfficial[]; email?: string | null };
const sets = [pin as unknown as { source: string; fetchedAt: string; items: Row[] }];

/** Officials as the barangay's own website lists them. Only towns whose barangay sites we have read; undefined elsewhere (never guessed). */
const POS: [RegExp, string][] = [[/^barangay captain:?$/i, "Punong Barangay"], [/^sk chai?r?man:?$/i, "SK Chairman"], [/^kagawad:?$/i, "Kagawad"]];
const tidy = (p: string) => POS.find(([re]) => re.test(p.trim()))?.[1] ?? p.replace(/:$/, "");

export function getBarangayOfficials(pcode: string): BrgyOfficials | undefined {
  for (const s of sets) {
    const r = s.items.find((x) => x.pcode === pcode && x.officials.length);
    if (r) return { site: r.site, officials: r.officials.map((o) => ({ ...o, position: tidy(o.position) })), email: r.email ?? null, fetchedAt: s.fetchedAt, source: s.source };
  }
  return undefined;
}
