// Pure helpers shared by scripts/fetch-dpwh.mjs and its tests.
const NAMES = {
  baco: "BACO", bansud: "BANSUD", bongabong: "BONGABONG", bulalacao: "BULALACAO", "calapan-city": "CALAPAN",
  gloria: "GLORIA", mansalay: "MANSALAY", naujan: "NAUJAN", pinamalayan: "PINAMALAYAN", pola: "POLA",
  "puerto-galera": "PUERTO GALERA", roxas: "ROXAS", "san-teodoro": "SAN TEODORO", socorro: "SOCORRO", victoria: "VICTORIA",
};

/** The municipality slug named closest to the end of a DPWH project title (titles end with the place). */
export function titleTown(title) {
  const t = String(title).toUpperCase();
  let best, bestAt = -1;
  for (const [slug, name] of Object.entries(NAMES)) {
    const re = new RegExp(`\\b${name}\\b`, "g");
    for (const m of t.matchAll(re)) if (m.index > bestAt) { best = slug; bestAt = m.index; }
  }
  return best;
}

/**
 * Decide the municipality of a project.
 * xy: slug from point-in-polygon on coordinates; title: slug from the title; deo: row is from the Mindoro Oriental DEO.
 * If coordinates and title name different towns the row is left unassigned and marked uncertain.
 */
export function assignTown({ xy, title, deo }) {
  if (xy && title && xy !== title) return { municipality: undefined, uncertain: true };
  if (xy) return { municipality: xy };
  return { municipality: deo ? title : undefined };
}
