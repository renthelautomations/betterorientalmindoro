// [English, Filipino]. LGU contact card and office directory. Office names, numbers and emails stay as the LGU published them.
export const LGU = {
  "lgu.eyebrow": ["OFFICIAL CONTACT", "OPISYAL NA KONTAK"],
  "lgu.call": ["Call the municipal hall", "Tumawag sa munisipyo"],
  "lgu.online": ["Message or visit online", "Mag-message o bumisita online"],
  "lgu.email": ["EMAIL", "EMAIL"],
  "lgu.website": ["WEBSITE", "WEBSITE"],
  "lgu.facebook": ["FACEBOOK", "FACEBOOK"],
  "lgu.note": ["Nothing listed means we found no confirmed official one.", "Walang naka-lista = wala kaming nakumpirmang opisyal."],
  "lgu.dir.tab": ["Directory", "Direktoryo"],
  "lgu.dir.title": ["Office directory", "Direktoryo ng mga opisina"],
  "lgu.dir.safety": ["Safety and emergency", "Kaligtasan at emergency"],
  "lgu.dir.health": ["Health", "Kalusugan"],
  "lgu.dir.office": ["Government offices", "Mga opisina ng pamahalaan"],
  "lgu.dir.note": ["From the LGU's official website. Offices with no listed number or email are left out.", "Ayon sa opisyal na website ng LGU. Hindi kasama ang opisinang walang nakalistang numero o email."],
} as const satisfies Record<string, readonly [string, string]>;
