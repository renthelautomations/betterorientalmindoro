// Pure helpers for the officials' service record and vote figures. Used by scripts/fetch-officials.mjs, tested in officials-record.test.ts.
const SUFFIX = new Set(["JR", "SR", "II", "III", "IV"]);
/** Same person across years: last name + first name, upper case, letters only, suffixes dropped. */
export const personKey = (last, first) => {
  const clean = (s) => String(s ?? "").toUpperCase().replace(/[^A-ZÑ ]/g, " ").split(/\s+/).filter((w) => w && !SUFFIX.has(w)).join("");
  return `${clean(last)}|${clean(first)}`;
};

const CYCLE = 3;
/** wins: [{year, position, town}] for ONE person, any order. Current position = the one held in `currentYear`.
 *  streak = consecutive elections (every 3 years) to that position ending in currentYear; earlier = every other run of wins, grouped by position and town. */
export function serviceRecord(wins, currentYear, currentPosition) {
  const mine = wins.filter((w) => w.position === currentPosition).map((w) => w.year).sort((a, b) => b - a);
  const years = [];
  for (const y of mine) if (y === currentYear - years.length * CYCLE) years.push(y); else if (y < currentYear - years.length * CYCLE) break;
  const used = new Set(years.map((y) => `${currentPosition}|${y}`));
  const groups = new Map();
  for (const w of [...wins].sort((a, b) => a.year - b.year)) {
    if (used.has(`${w.position}|${w.year}`)) continue;
    const k = `${w.position}|${w.town ?? ""}`;
    (groups.get(k) ?? groups.set(k, { position: w.position, town: w.town, years: [] }).get(k)).years.push(w.year);
  }
  return { streak: years.length, years: years.reverse(), earlier: [...groups.values()].sort((a, b) => b.years.at(-1) - a.years.at(-1)) };
}

/** rows: vote rows of ONE contest [{key, name, party, votes}], candidates already summed over cities. winnerKeys: keys of the seat holders.
 *  Single seat: share and runner-up. Multi seat: rank among candidates, only when the winners really are the top of the list. */
export function contestFigures(rows, winnerKeys) {
  const by = [...rows].sort((a, b) => b.votes - a.votes);
  const total = by.reduce((s, r) => s + r.votes, 0);
  const out = new Map();
  if (winnerKeys.length === 1) {
    const w = by[0], ru = by[1];
    if (w && w.key === winnerKeys[0]) out.set(w.key, { votes: w.votes, share: total ? w.votes / total : null, runnerUp: ru ? { name: ru.name, party: ru.party, votes: ru.votes } : null });
    return out;
  }
  const top = new Set(by.slice(0, winnerKeys.length).map((r) => r.key));
  if (!winnerKeys.every((k) => top.has(k))) return out; // rows incomplete or odd: show nothing rather than a wrong rank
  by.forEach((r, i) => { if (winnerKeys.includes(r.key)) out.set(r.key, { votes: r.votes, rank: i + 1, of: by.length }); });
  return out;
}
