/** Small shared matching helpers: lowercase and strip accents, split into words, prefix match with one typo allowed on words of 4+ letters. */
export const norm = (s: string) => s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
export const toks = (s: string) => norm(s).split(/[^a-z0-9]+/).filter(Boolean);
export function lev(a: string, b: string): number {
  const d = Array.from({ length: a.length + 1 }, (_, i) => [i, ...Array(b.length).fill(0)] as number[]);
  for (let j = 1; j <= b.length; j++) d[0][j] = j;
  for (let i = 1; i <= a.length; i++) for (let j = 1; j <= b.length; j++) d[i][j] = Math.min(d[i - 1][j] + 1, d[i][j - 1] + 1, d[i - 1][j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
  return d[a.length][b.length];
}
export const hit = (word: string, t: string) => word.startsWith(t) || (t.length >= 4 && word.length >= 4 && lev(word, t) <= 1);
