import type { Brgy } from "./barangays";
import type { Project } from "./projects";

// ONE rule for "which barangay is this DPWH project in", used by the barangay pages, the barangay cards, the town tab and anything else that counts projects per barangay.
// 1. If the title names barangays after "Brgy." / "Barangay" (a road can cross several), the project belongs to each of them. DPWH gives a road one GPS point, which can sit in the next barangay.
// 2. Otherwise it belongs to the barangay that holds its GPS point.
// A project whose title and GPS point disagree keeps the title barangays and records the GPS one in `gps`.
const fold = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[.]/g, " ").replace(/\s+/g, " ").trim();
const alias = (n: string) => fold(n.replace(/\s*\(.*\)/, "")).replace(/^sta /, "(?:sta|santa) ").replace(/^sto /, "(?:sto|santo) ");

export type Place = { named: string[]; gps: string | null };

/** Barangay codes named after a "Brgy." keyword in the title. Pure: the barangay list is the town's. */
export function namedBarangays(title: string, brgs: Pick<Brgy, "code" | "name">[]): string[] {
  const t = fold(title), out = new Set<string>();
  const names = brgs.map((b) => ({ code: b.code, long: fold(b.name.replace(/\s*\(.*\)/, "")).replace(/ /g, "").length >= 8 && !/^zone|^poblacion/.test(fold(b.name)), re: new RegExp(`(?<![a-z0-9])${alias(b.name)}(?![a-z0-9])`) })).sort((a, b) => b.re.source.length - a.re.source.length);
  for (const m of t.matchAll(/\b(?:brgys?|barangays?)\b\s*/g)) {
    const after = t.slice(m.index! + m[0].length, m.index! + m[0].length + 90);
    for (const n of names) if (n.re.test(after)) out.add(n.code);
  }
  if (!out.size) { // no Brgy. keyword: a long, unmistakable barangay name anywhere in the title ("QUINABIGAN BR.", "QUINABIGAN NHS") still names it; short names that are also ordinary words (Pili, Buli, Malaya) do not
    for (const n of names) if (n.long && n.re.test(t)) out.add(n.code);
  }
  return [...out];
}

export function placeProject(p: Project, brgs: Brgy[], inside: (b: Brgy, lon: number, lat: number) => boolean): Place {
  const gps = p.lon != null && p.lat != null ? brgs.find((b) => inside(b, p.lon!, p.lat!))?.code ?? null : null;
  return { named: namedBarangays(p.title, brgs), gps };
}

/** Does the project belong to this barangay under the rule above? */
export const belongsTo = (pl: Place, code: string) => (pl.named.length ? pl.named.includes(code) : pl.gps === code);
