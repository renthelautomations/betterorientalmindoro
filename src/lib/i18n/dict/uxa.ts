// UI revamp slot A: "area.thing": ["English", "Filipino"]. Filipino drafts await native-speaker review.
export const UXA = {
  "uxa.doc.updated": ["Last updated", "Huling na-update"],
  "uxa.doc.toc": ["On this page", "Sa pahinang ito"],
  "uxa.svc.open": ["Open the official source", "Buksan ang opisyal na source"],
  "uxa.svc.details": ["Fees and eligibility", "Bayad at kuwalipikasyon"],
  "uxa.svc.where": ["Where to go", "Saan pupunta"],
  "uxa.svc.source": ["Source", "Pinagmulan"],
  "uxa.svc.related": ["More in this category", "Iba pa sa kategoryang ito"],
} as const satisfies Record<string, readonly [string, string]>;
