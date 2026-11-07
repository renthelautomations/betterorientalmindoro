import data from "@/data/hotlines.json";
import { hit, toks } from "./fuzzy";

export type Category = "emergency" | "medical" | "government" | "utility";
// verifiedAt = date the source page was read; confirmed = source is the provincial government site.
export type Hotline = { id: string; scope: string; category: Category; name: string; number: string; source: string; verifiedAt: string; confirmed: boolean };

const all = data as Hotline[];

export const getHotlines = (scope?: string): Hotline[] => (scope ? all.filter((h) => h.scope === scope) : all);

export const groupByCategory = (rows: Hotline[]): Partial<Record<Category, Hotline[]>> => {
  const g: Partial<Record<Category, Hotline[]>> = {};
  for (const h of rows) (g[h.category] ??= []).push(h);
  return g;
};

/** Numbers for one bayan (may be none) plus the province-wide fallback. Never invents: unknown or empty bayan gives local = []. */
export const hotlinesForBayan = (slug?: string) => ({
  local: slug && slug !== "province" ? getHotlines(slug) : [],
  province: getHotlines("province"),
});

// ---- office, smart search -------------------------------------------------
export type Office = "drrm" | "police" | "fire" | "coastguard" | "governor" | "safety" | "other";
export const OFFICES: Office[] = ["drrm", "police", "fire", "coastguard", "governor", "safety", "other"];
/** Which office a hotline belongs to, from its published name. */
export function officeOf(name: string): Office {
  return /police|pnp/i.test(name) ? "police" : /fire|bfp/i.test(name) ? "fire" : /coast guard|pcg/i.test(name) ? "coastguard"
    : /drrm|pdrrmo|mdrrm/i.test(name) ? "drrm" : /governor|capitol/i.test(name) ? "governor" : /public safety/i.test(name) ? "safety" : "other";
}
// Everyday words (Filipino and English) people type for each office. Used to match what they mean, not just what is printed.
const WORDS: Record<Office, string[]> = {
  police: ["pulis", "police", "pnp", "krimen", "crime", "magnanakaw", "holdap", "nakawan", "away", "patrol"],
  fire: ["sunog", "fire", "bfp", "bumbero", "firefighter", "apoy", "nasusunog"],
  drrm: ["baha", "flood", "bagyo", "typhoon", "lindol", "earthquake", "sakuna", "disaster", "rescue", "saklolo", "landslide", "pdrrmo", "drrm", "kalamidad", "evacuate"],
  coastguard: ["dagat", "sea", "bangka", "boat", "lunod", "drown", "barko", "ship", "coast", "guard", "pcg", "maritime"],
  governor: ["gobernador", "governor", "capitol", "kapitolyo", "lalawigan", "province"],
  safety: ["kaligtasan", "safety", "emergency", "public"],
  other: [],
};
/** Ranked matches. Every query word must match a word of the hotline's name, town, category or the everyday words for its office (prefix, or one typo). Empty query returns []. */
export function searchHotlines(rows: Hotline[], q: string, townName: (scope: string) => string): Hotline[] {
  const qt = toks(q);
  if (!qt.length) return [];
  const scored: [Hotline, number][] = [];
  for (const h of rows) {
    const own = toks(h.name), extra = [...toks(townName(h.scope)), h.category, ...WORDS[officeOf(h.name)]];
    let score = 0, ok = true;
    for (const t of qt) {
      if (own.some((w) => hit(w, t))) score += 3;
      else if (extra.some((w) => hit(w, t))) score += 1;
      else { ok = false; break; }
    }
    if (ok) scored.push([h, score]);
  }
  return scored.sort((a, b) => b[1] - a[1]).map(([h]) => h);
}
/** One-tap suggestions shown before typing: [label key, query]. */
export const QUICK: [string, string][] = [["hot.q.fire", "sunog"], ["hot.q.police", "pulis"], ["hot.q.flood", "baha"], ["hot.q.sea", "dagat"], ["hot.q.gov", "gobernador"]];
