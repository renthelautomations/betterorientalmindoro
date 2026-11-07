// UI revamp slot B: "area.thing": ["English", "Filipino"]. Filipino drafts await native-speaker review.
export const UXB = {
  "uxb.proj.related": ["Related projects", "Mga kaugnay na proyekto"],
  "uxb.proj.relatedeyebrow": ["MORE LIKE THIS", "KATULAD NITO"],
  "uxb.proj.relatedhint": ["Same town or same kind of work, biggest published budget first.", "Parehong bayan o parehong uri ng gawain, pinakamalaking published na budget muna."],
  "uxb.proj.honesty": ["A published budget figure, not actual spending, and not an allegation against anyone.", "Published na budget ito, hindi aktwal na gastos, at hindi paratang laban kaninuman."],
  "uxb.proj.facts": ["Key facts", "Mahahalagang datos"],
  "uxb.proj.undated": ["No dates in the document", "Walang petsa sa dokumento"],
  "uxb.row.pub": ["published budget", "published na budget"],
} as const satisfies Record<string, readonly [string, string]>;
