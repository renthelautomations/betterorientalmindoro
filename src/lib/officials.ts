import data from "@/data/officials/2025.json";
import { titleCase } from "./dyn-pure";

type Earlier = { position: string; town: string | null; years: number[] };
type RunnerUp = { name: string; party: string | null; votes: number };
type Row = {
  position: string; town: string | null; last: string; first: string; middle: string | null; title: string | null; party: string | null;
  streak: number; years: number[]; earlier: Earlier[]; votes?: number; share?: number | null; runnerUp?: RunnerUp | null; rank?: number | null; of?: number | null;
};
export type Role = "governor" | "vice-governor" | "house" | "board" | "mayor" | "vice-mayor" | "councilor";
export type Official = {
  id: string; name: string; last: string; party: string | null; town: string | null; role: Role;
  streak: number; years: number[]; earlier: { role: string; town: string | null; years: number[] }[];
  votes: number | null; share: number | null; runnerUp: RunnerUp | null; rank: number | null; of: number | null;
};

const ROLE: Record<string, Role> = {
  GOVERNOR: "governor", "VICE GOVERNOR": "vice-governor", "MEMBER, HOUSE OF REPRESENTATIVES": "house",
  "PROVINCIAL BOARD MEMBER": "board", MAYOR: "mayor", "VICE MAYOR": "vice-mayor", COUNCILOR: "councilor",
};

export const OFFICIALS_SOURCE = data as { source: string; sourceUrl: string; term: string };

/** Full party names. IND/LAKAS/PFP/LP/LDP/AKSYON are national parties; GSM and MBS are local parties of Oriental Mindoro (named by Mindoro Today, a local news site). */
export const PARTY: Record<string, string> = {
  LAKAS: "Lakas–CMD", PFP: "Partido Federal ng Pilipinas", LP: "Liberal Party", LDP: "Laban ng Demokratikong Pilipino", AKSYON: "Aksyon Demokratiko", IND: "Independent",
  GSM: "Galing at Serbisyo para sa Mindoreño", MBS: "Mindoro Bago Sarili",
};

const all: Official[] = (data.items as unknown as Row[]).map((r, i) => ({
  id: `${ROLE[r.position]}-${i}`,
  name: titleCase([r.title, r.first, r.middle, r.last].filter(Boolean).join(" ")),
  last: r.last, party: r.party, town: r.town, role: ROLE[r.position],
  streak: r.streak ?? 0, years: r.years ?? [], earlier: (r.earlier ?? []).map((e) => ({ role: ROLE[e.position] ?? e.position, town: e.town, years: e.years })),
  votes: r.votes ?? null, share: r.share ?? null, runnerUp: r.runnerUp ?? null, rank: r.rank ?? null, of: r.of ?? null,
}));

/** Province-wide offices (governor, vice governor, House members, board members). */
export const provinceOfficials = (role: Role) => all.filter((o) => !o.town && o.role === role);
/** One town's mayor, vice mayor and councilors. */
export const townOfficials = (slug: string, role: Role) => all.filter((o) => o.town === slug && o.role === role);

/** Other current officials with the same surname: in the same town, or holding a province-wide office either way. A shared surname alone says nothing about family. */
export function sameSurname(o: Official): Official[] {
  return all.filter((x) => x.id !== o.id && x.last === o.last && (x.town === o.town || !x.town || !o.town));
}
