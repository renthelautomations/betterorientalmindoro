import { T } from "@/lib/i18n/i18n";
import { Landmark } from "@/components/site/KitT";
import { getHotlines } from "@/lib/hotlines";

const SHOW = ["Police", "Fire", "PDRRMO Operations and Warning Division"];
const short = (n: string) => (n.startsWith("PDRRMO") ? "PDRRMO" : n);
const tel = (n: string) => "tel:" + n.replace(/[^\d+]/g, "");

// Only numbers from the provincial government site (confirmed) appear here.
export default function EmergencyBar() {
  const rows = SHOW.map((n) => getHotlines("province").find((h) => h.confirmed && h.name === n)).filter(Boolean);
  return (
    <Landmark as="aside" label="home.emerg.aria" className="bg-[var(--navy)] text-xs text-white">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-x-5 px-4">
        <span className="font-semibold"><T k="home.emerg" />: <a href="tel:911" className="inline-flex min-h-8 items-center underline">911</a></span>
        {rows.map((h) => (
          <a key={h!.id} href={tel(h!.number)} className="inline-flex min-h-8 items-center hover:underline">{short(h!.name)}: {h!.number}</a>
        ))}
      </div>
    </Landmark>
  );
}
