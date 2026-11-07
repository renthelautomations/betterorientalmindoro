/** Picks the "1" or "N" variant of a dictionary key pair, e.g. finance.line1 / finance.lineN. */
export const plural = (n: number, base: string) => `${base}${n === 1 ? "1" : "N"}`;
