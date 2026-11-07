import data from "@/data/lgu-contacts.json";

// Official-channel contacts per LGU. email/landline/mobile come from the DILG MIMAROPA directory; facebook pages were opened and matched by page name.
export type LguContact = {
  email: string[]; landline: string[]; mobile: string[]; website: string | null;
  facebook: { label: string; url: string }[]; source: string; extraSources?: { label: string; url: string }[]; verifiedAt: string;
};

const all = data as Record<string, LguContact>;

/** Unknown slug returns undefined. Never invents. */
export const getLguContact = (slug: string): LguContact | undefined => all[slug];
