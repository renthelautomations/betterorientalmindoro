// Estatistika (and chart-layout) interface strings: "area.thing": ["English", "Filipino"].
// Filipino drafts await native-speaker review.
export const ESTAT = {
  "est.view.cards": ["Cards", "Mga card"], "est.sort": ["Sort by", "Ayusin ayon sa"], "est.rank.of": ["Rank by population among the 15 towns", "Ranggo sa populasyon sa 15 bayan"],
} as const satisfies Record<string, readonly [string, string]>;
