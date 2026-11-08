/** "CALAPAN CITY" -> "Calapan City" so every address reads the same; mixed-case text is left alone. */
export const tidy = (s: string) => (s === s.toUpperCase() && /[A-Z]{3}/.test(s) ? s.toLowerCase().replace(/(^|[\s,(/-])([a-z])/g, (_, a, b) => a + b.toUpperCase()) : s);
/** One string may hold several numbers ("0917 190 8101 288-7819"): split them, never merge them into one button. */
export const numbers = (raw: string | null | undefined): string[] => {
  if (!raw) return [];
  const m = raw.match(/\(?\+?\d[\d\s().-]{5,}\d/g);
  const found = m ? m.flatMap((x) => (x.replace(/\D/g, "").length > 12 ? (x.match(/09\d{2}[\s-]?\d{3}[\s-]?\d{4}|\d{3}[\s-]?\d{4}/g) ?? [x]) : [x])) : [raw];
  return found.map((x) => x.trim());
};

