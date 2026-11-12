import data from "@/data/lgu-directory.json";

export type OfficeGroup = "kaligtasan" | "kalusugan" | "opisina";
// Offices exactly as the LGU's own site publishes them. Only offices with at least a phone or email are kept.
export type Office = { name: string; category: OfficeGroup; phone: string[]; email: string[]; head?: string; address?: string; facebook?: string };
export type LguDirectory = { source: string; verifiedAt: string; offices: Office[]; headsSource?: string; staff?: { name: string; role: string; unit: string }[]; unlisted?: { office: string; head: string }[] };

const all = data as Record<string, LguDirectory>;

/** Slug or "province". Undefined when we have no published directory for that LGU (never invented). */
export const getLguDirectory = (slug: string): LguDirectory | undefined => all[slug];

export const groupOffices = (offices: Office[]): Record<OfficeGroup, Office[]> => ({
  kaligtasan: offices.filter((o) => o.category === "kaligtasan"),
  kalusugan: offices.filter((o) => o.category === "kalusugan"),
  opisina: offices.filter((o) => o.category === "opisina"),
});
