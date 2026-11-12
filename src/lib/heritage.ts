// Verified history facts. Each entry cites what it was checked against (opened 2026-11-12).
// Not included on purpose: NHCP marker years (only a secondary list found), "Mina de Oro" (folk etymology), Naujan Lake figures (sources conflict).
export type HSrc = { label: string; url: string };
export const MILESTONES: { year: string; id: string; src: HSrc[] }[] = [
  { year: "1571", id: "1571", src: [{ label: "ormindoro.gov.ph, History", url: "https://ormindoro.gov.ph/history/" }] },
  { year: "1950", id: "1950", src: [{ label: "Republic Act No. 505, ChanRobles", url: "https://chanrobles.com/republicacts/republicactno505.html" }, { label: "Proclamation No. 186, LawPhil", url: "https://lawphil.net/executive/proc/proc1950/proc_186_1950.html" }] },
  { year: "1977", id: "1977", src: [{ label: "UNESCO, Puerto Galera Biosphere Reserve", url: "https://www.unesco.org/en/mab/puerto-galera" }] },
  { year: "1999", id: "1999", src: [{ label: "UNESCO, Memory of the World", url: "https://www.unesco.org/en/memory-world/philippine-paleographs-hanunoo-buid-tagbanua-and-palawan" }] },
  { year: "2000", id: "2000", src: [{ label: "Mangyan Heritage Center, About", url: "https://mangyanheritage.odoo.com/about" }] },
  { year: "2001", id: "2001", src: [{ label: "PTV News", url: "https://ptvnews.ph/pandang-gitab-oriental-mindoros-unique-festival-of-lights" }] },
];
export const LIVING: { id: string; icon: "people" | "doc" | "pin"; src: HSrc }[] = [
  { id: "mangyan", icon: "people", src: { label: "Mangyan Heritage Center, Mangyan groups", url: "https://mangyanheritage.odoo.com/mangyan-groups" } },
  { id: "ambahan", icon: "doc", src: { label: "UNESCO, Memory of the World", url: "https://www.unesco.org/en/memory-world/philippine-paleographs-hanunoo-buid-tagbanua-and-palawan" } },
  { id: "pandang", icon: "pin", src: { label: "Philstar, 2012", url: "https://www.philstar.com/nation/2012/12/02/878169/pandang-gitab-now-official-festival-oriental-mindoro" } },
];
