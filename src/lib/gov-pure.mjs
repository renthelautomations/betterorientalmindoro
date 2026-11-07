// Pure helpers shared by scripts/fetch-gov.mjs and src/lib/gov.ts (plain .mjs so the fetch script can import them).

/** Coarse class of a procurement title, by keyword. First matching rule wins; order matters. */
const WORK_RULES = [
  ["bridge", /\b(bridge|footbridge|viaduct)\b/i],
  ["drainage", /\b(drainage|drain|canal|culvert|flood|river control|riprap|slope protection|sea ?wall|revetment)\b/i],
  ["water", /\b(water supply|waterworks|water system|potable|deep ?well|level ii|level iii|pipeline|reservoir)\b/i],
  ["road", /\b(road|roads|pavement|concreting|asphalt|overlay|highway|street|access|farm[- ]to[- ]market)\b/i],
  ["building", /\b(covered court|classroom|plaza|museum|pier|capitol|tourist|rest area|building|hall|gymnasium|gym|school|classroom|hospital|complex|center|centre|terminal|market|office|dormitory|clinic|facility|multi[- ]purpose|stage|pavilion|fence|wall|rehabilitation of)\b/i],
];
export function workClass(title) {
  const t = String(title ?? "");
  for (const [k, re] of WORK_RULES) if (re.test(t)) return k;
  return "other";
}

/** "Executive Order No. 61 Series of 2026" -> { number: 61, suffix: null, year: 2026 }; "No.16 A Series of 2024" -> suffix "A". Unparseable parts are null. */
export function parseEo(title) {
  const t = String(title ?? "");
  const m = t.match(/Order\s+No\.?\s*(\d+)\s*-?([A-Z])?\s*,?\s*Series\s+of\s+(\d{4})/i);
  return m ? { number: Number(m[1]), suffix: m[2]?.toUpperCase() ?? null, year: Number(m[3]) } : { number: null, suffix: null, year: null };
}
