import Link from "next/link";
import { cleanTitle, projectDigest, type Project } from "@/lib/projects";
import { T } from "@/lib/i18n/i18n";
import { StatusBadge, peso } from "./ProjectBits";

/** Table view of projects. Server-rendered; each title links to the record. Scrolls sideways on narrow screens. */
export default function ProjectsTable({ rows, names }: { rows: Project[]; names: Record<string, string> }) {
  const th = "px-4 py-3 font-semibold";
  return (
    <div role="region" tabIndex={0} aria-labelledby="lista" className="mt-4 overflow-x-auto rounded-2xl bg-white shadow-sm ring-1 ring-black/5">
      <table className="w-full min-w-[46rem] border-collapse text-left text-sm">
        <caption className="sr-only"><T k="proyekto.table.caption" /></caption>
        <thead>
          <tr className="bg-fiesta-navy text-xs text-white">
            <th scope="col" className={th}><T k="proyekto.col.project" /></th>
            <th scope="col" className={th}><T k="proyekto.col.bayan" /></th>
            <th scope="col" className={th}><T k="proyekto.col.year" /></th>
            <th scope="col" className={th}><T k="proyekto.col.status" /></th>
            <th scope="col" className={`${th} text-right`}><T k="proyekto.col.budget" /></th>
          </tr>
        </thead>
        <tbody>
          {rows.map((p, i) => {
            const d = projectDigest(p.title);
            return (
              <tr key={p.id} className={`border-b border-black/5 align-top last:border-0 ${i % 2 ? "bg-fiesta-cream/60" : ""}`}>
                <td className="max-w-md px-4 py-3">
                  <Link href={`/proyekto/${p.id}`} className="font-semibold text-fiesta-navy hover:underline">{d.headline ?? cleanTitle(p.title)}</Link>
                  {d.headline && <p className="mt-0.5 line-clamp-1 text-xs text-black/65">{cleanTitle(p.title)}</p>}
                </td>
                <td className="whitespace-nowrap px-4 py-3">{p.municipality ? names[p.municipality] : "–"}</td>
                <td className="px-4 py-3 tabular-nums">{p.year ?? "–"}</td>
                <td className="px-4 py-3"><StatusBadge status={p.status} /></td>
                <td className="whitespace-nowrap px-4 py-3 text-right font-serif text-base font-bold tabular-nums text-fiesta-navy">{peso(p.cost)}</td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
