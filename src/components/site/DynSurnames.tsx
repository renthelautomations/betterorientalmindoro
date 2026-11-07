import { T } from "@/lib/i18n/i18n";
import SurnameCards from "./SurnameCards";
import { surnameHolders, titleCase, type ProvinceSurnameRow, type SurnameRow, type Town } from "@/lib/dynasties";

type Row = SurnameRow | ProvinceSurnameRow;

/** Repeated surnames (2+ different people) as cards that open to a visual breakdown. Surname match only. Only lean data goes to the client. */
export default function DynSurnames({ rows, towns, names }: { rows: Row[]; towns: Town[]; names: Record<string, string> }) {
  if (!rows.length) return <p className="text-sm text-black/70"><T k="dyn.sur.none" /></p>;
  const cards = rows.map((r) => ({ surname: r.surname, label: titleCase(r.surname), seats: r.seats, people: r.people, holders: surnameHolders(towns, r.surname).map((h) => ({ ...h, name: titleCase(h.name) })) }));
  return <SurnameCards cards={cards} names={names} />;
}
