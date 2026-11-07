import type { Metadata } from "next";
import Link from "next/link";
import { getMunicipalities } from "@/lib/municipalities";
import { getProjects, getProjectStats } from "@/lib/projects";

export const metadata: Metadata = { title: "Proyekto" };

const peso = (n?: number) => (n == null ? "-" : "₱" + Math.round(n).toLocaleString("en-PH"));

export default function Proyekto() {
  const s = getProjectStats();
  const names = Object.fromEntries(getMunicipalities().map((m) => [m.slug, m.name]));
  const rows = [...getProjects()].sort((a, b) => (b.cost ?? 0) - (a.cost ?? 0)).slice(0, 100);
  return (
    <main className="mx-auto max-w-6xl px-4 py-10">
      <h1 className="font-serif text-3xl font-bold md:text-4xl">Mga proyekto ng DPWH</h1>
      <p className="mt-2 max-w-3xl text-black/70">
        {s.total.toLocaleString()} proyekto sa Oriental Mindoro, {s.assigned.toLocaleString()} dito ay naka-assign sa bayan ayon sa coordinates at pamagat. Ang iba ay hindi tiyak ang bayan.
        Ang ipinapakita ay ang 100 pinakamalaki ayon sa budget.
      </p>
      <p className="mt-2 text-sm text-black/60">
        Budget ang halaga, hindi ang aktwal na gastos. Ang bayan ay hinuhulaan mula sa coordinates at pamagat; kapag hindi magkatugma, hindi ito inaassign.
        Source: DPWH Infrastructure Transparency Dataset via BetterGov Open Data (CC0).
      </p>
      <div className="mt-6 overflow-x-auto rounded-xl border border-black/10 bg-white">
        <table className="w-full min-w-[720px] text-left text-sm">
          <thead className="bg-black/5 text-xs uppercase tracking-wider text-black/60">
            <tr><th className="p-3">Proyekto</th><th className="p-3">Bayan</th><th className="p-3">Katayuan</th><th className="p-3">Taon</th><th className="p-3 text-right">Budget</th></tr>
          </thead>
          <tbody className="divide-y divide-black/10">
            {rows.map((p) => (
              <tr key={p.id}>
                <td className="p-3">{p.title}</td>
                <td className="p-3">{p.municipality ? <Link href={`/bayan/${p.municipality}`} className="underline">{names[p.municipality]}</Link> : "Hindi tiyak ang bayan"}</td>
                <td className="p-3">{p.status ?? "-"}</td>
                <td className="p-3">{p.year ?? "-"}</td>
                <td className="p-3 text-right tabular-nums">{peso(p.cost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  );
}
