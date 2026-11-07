/** Pure logic for the site-wide smart search: accent-folded words, prefix and one-typo matching, EN/FIL synonym groups, ranked results, "did you mean". */
export type SearchType = "bayan" | "serbisyo" | "hotline" | "pahina" | "kwento" | "faq";
export type SearchItem = {
  type: SearchType; title: string; sub?: string; href: string;
  /** dictionary key for the title, when it should follow the EN/FIL toggle */
  tk?: string;
  /** extra searchable words (both languages), never shown */
  kw?: string;
  /** shown under "Popular" before typing */
  pop?: boolean;
};

// Words that mean the same thing for a resident, in English and Filipino. A query word also matches its group mates.
const GROUPS = [
  "sunog fire bumbero bfp", "pulis police pnp", "baha flood bagyo typhoon sakuna disaster", "ambulansya ambulance sagip rescue emergency",
  "libing burial patay namatay death", "gamot medicine medisina", "ospital hospital", "negosyo business dti permit", "buwis tax taxes bir",
  "sertipiko certificate", "kapanganakan birth panganganak baby sanggol", "iskolar scholarship scholar estudyante student peap",
  "matanda senior elderly", "rabies aso dog kagat bite", "kalsada road daan highway", "proyekto project dpwh", "badyet budget pondo gastos nep",
  "istatistika statistics populasyon population", "dinastiya dynasty dynasties", "hotline tawag call numero number telepono phone",
  "bayan town municipality lungsod city", "kuryente electricity power", "tubig water", "serbisyo service services", "kwento story stories",
].map((g) => g.split(" "));

export const fold = (s: string) => s.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
export const words = (s: string) => fold(s).split(/[^a-z0-9]+/).filter(Boolean);

function lev(a: string, b: string, max: number): number {
  if (Math.abs(a.length - b.length) > max) return max + 1;
  let prev = Array.from({ length: b.length + 1 }, (_, i) => i);
  for (let i = 1; i <= a.length; i++) {
    const cur = [i];
    for (let j = 1; j <= b.length; j++) cur[j] = Math.min(prev[j] + 1, cur[j - 1] + 1, prev[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
    prev = cur;
  }
  return prev[b.length];
}
/** 2 exact word, 1.6 prefix, 1 one typo (word of 4+ letters), 0 no match. */
function wordHit(w: string, q: string): number {
  if (w === q) return 2;
  if (w.startsWith(q)) return 1.6;
  if (q.length >= 4 && lev(w.slice(0, q.length + 1), q, 1) <= 1) return 1;
  return 0;
}
const alts = (q: string) => { const g = GROUPS.find((x) => x.includes(q)); return g ?? [q]; };
const best = (ws: string[], q: string) => Math.max(0, ...alts(q).map((a) => Math.max(0, ...ws.map((w) => wordHit(w, a) * (a === q ? 1 : 0.8)))));

const STOP = new Set(["ng", "sa", "na", "ang", "mga", "at", "of", "the", "a", "an", "and", "to", "for"]);
const queryWords = (q: string) => { const w = words(q); const k = w.filter((x) => !STOP.has(x)); return k.length ? k : w; };

const PRIORITY: Record<SearchType, number> = { bayan: 5, serbisyo: 4, hotline: 4, pahina: 6, kwento: 2, faq: 1 };

/** Ranked matches. Every query word must hit (own words, or synonyms, or one typo). Title hits beat hits in the description. `titleOf` lets the caller search the translated title too. */
export function rank(items: SearchItem[], q: string, titleOf: (i: SearchItem) => string = (i) => i.title, limit = 24): SearchItem[] {
  const qt = queryWords(q);
  if (!qt.length) return [];
  const phrase = fold(q).trim();
  const out: [SearchItem, number][] = [];
  for (const i of items) {
    const tw = words(titleOf(i) + " " + i.title), xw = words((i.sub ?? "") + " " + (i.kw ?? ""));
    let score = 0, ok = true;
    for (const w of qt) {
      const a = best(tw, w), b = best(xw, w);
      if (a) score += 3 * a; else if (b) score += b; else { ok = false; break; }
    }
    if (!ok) continue;
    if (fold(titleOf(i)).includes(phrase) || fold(i.title).includes(phrase)) score += 3;
    out.push([i, score + PRIORITY[i.type] * 0.1]);
  }
  return out.sort((a, b) => b[1] - a[1]).slice(0, limit).map(([i]) => i);
}

/** Closest title word to a query word that found nothing, for "Did you mean …?". */
export function didYouMean(items: SearchItem[], q: string, titleOf: (i: SearchItem) => string = (i) => i.title): string | undefined {
  const qt = words(q); if (!qt.length) return undefined;
  const pool = new Set(items.flatMap((i) => words(titleOf(i))).filter((w) => w.length >= 4));
  const fixed = qt.map((w) => {
    if (w.length < 3 || [...pool].some((p) => p.startsWith(w))) return w;
    let bestW = w, d = 3; for (const p of pool) { const x = lev(p, w, 2); if (x < d) { d = x; bestW = p; } }
    return d <= 2 ? bestW : w;
  });
  const s = fixed.join(" ");
  return s !== qt.join(" ") ? s : undefined;
}

/** Group results by type, in the order of the first best hit. */
export function groupByType(hits: SearchItem[]): [SearchType, SearchItem[]][] {
  const m = new Map<SearchType, SearchItem[]>();
  for (const h of hits) m.set(h.type, [...(m.get(h.type) ?? []), h]);
  return [...m.entries()];
}

export type Recent = { title: string; href: string; type: SearchType; tk?: string };
/** Newest first, no duplicates by href, at most `max`. */
export function pushRecent(list: Recent[], r: Recent, max = 5): Recent[] {
  return [r, ...list.filter((x) => x.href !== r.href)].slice(0, max);
}
