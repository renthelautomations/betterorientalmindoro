import data from "@/data/officials/2025.json";
import { titleCase } from "./dyn-pure";

type Row = { position: string; town: string | null; last: string; first: string; middle: string | null; title: string | null; party: string | null };
export type Official = { id: string; name: string; party: string | null; town: string | null; role: Role };
export type Role = "governor" | "vice-governor" | "house" | "board" | "mayor" | "vice-mayor" | "councilor";

const ROLE: Record<string, Role> = {
  GOVERNOR: "governor", "VICE GOVERNOR": "vice-governor", "MEMBER, HOUSE OF REPRESENTATIVES": "house",
  "PROVINCIAL BOARD MEMBER": "board", MAYOR: "mayor", "VICE MAYOR": "vice-mayor", COUNCILOR: "councilor",
};

export const OFFICIALS_SOURCE = data as { source: string; sourceUrl: string; term: string };

const all: Official[] = (data.items as Row[]).map((r, i) => ({
  id: `${ROLE[r.position]}-${i}`,
  name: titleCase([r.title, r.first, r.middle, r.last].filter(Boolean).join(" ")),
  party: r.party, town: r.town, role: ROLE[r.position],
}));

/** Province-wide offices (governor, vice governor, House members, board members). */
export const provinceOfficials = (role: Role) => all.filter((o) => !o.town && o.role === role);
/** One town's mayor, vice mayor and councilors. */
export const townOfficials = (slug: string, role: Role) => all.filter((o) => o.town === slug && o.role === role);
