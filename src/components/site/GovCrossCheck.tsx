import KitIcon from "@/components/kit/KitIcon";
import { crossCheck, type CheckRow } from "@/lib/gov-check";
import { T } from "@/lib/i18n/i18n";

const SRC = "https://ormindoro.gov.ph/about/";
const ST: Record<CheckRow["status"], { k: string; icon: "check" | "alert" | "search"; color: string; bg: string }> = {
  match: { k: "govc.cc.match", icon: "check", color: "#1f6b37", bg: "#e2f2e7" },
  close: { k: "govc.cc.close", icon: "check", color: "#1f6b37", bg: "#e2f2e7" },
  differs: { k: "govc.cc.differs", icon: "alert", color: "#8a5a00", bg: "#fdf0d0" },
  unknown: { k: "govc.cc.unknown", icon: "search", color: "#444", bg: "#eee" },
};
const num = (n: number | null, d = 0) => (n == null ? "–" : n.toLocaleString("en-PH", { maximumFractionDigits: d, minimumFractionDigits: d })); // a dash is no data, never zero

/** Official figures beside the ones this site derives from its own boundary data. Differences are shown plainly, never smoothed over. */
export default function GovCrossCheck() {
  const rows = crossCheck();
  return (
    <section aria-labelledby="gv-cc" className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-black/5 sm:p-6">
      <h2 id="gv-cc" className="font-serif text-2xl font-bold text-fiesta-navy"><T k="govc.cc.h" /></h2>
      <p className="mt-1 max-w-3xl text-sm text-black/70"><T k="govc.cc.lead" /></p>
      <ul className="mt-4 divide-y divide-black/10">
        {rows.map((r, i) => {
          const s = ST[r.status]; const area = i === 3;
          return (
            <li key={i} className="py-3">
              <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
                <p className="min-w-0 flex-1 basis-56 font-semibold text-fiesta-navy"><T k={`govc.cc.r${i}`} /></p>
                <p className="text-sm text-black/70"><span className="text-xs tracking-wide uppercase"><T k="govc.cc.official" /></span> <b className="tabular-nums text-fiesta-navy">{num(r.official, area ? 2 : 0)}</b></p>
                <p className="text-sm text-black/70"><span className="text-xs tracking-wide uppercase"><T k="govc.cc.ours" /></span> <b className="tabular-nums text-fiesta-navy">{num(r.ours, area ? 2 : 0)}</b></p>
                <span className="inline-flex min-h-8 items-center gap-1.5 rounded-full px-3 text-sm font-semibold" style={{ background: s.bg, color: s.color }}><KitIcon name={s.icon} className="h-4 w-4" />{<T k={s.k} />}</span>
              </div>
              {area && r.status === "differs" && <p className="mt-2 text-sm text-black/70"><T k="govc.cc.area" /></p>}
            </li>
          );
        })}
      </ul>
      <details className="mt-3 text-sm text-black/75">
        <summary className="inline-flex min-h-11 cursor-pointer items-center font-semibold text-fiesta-blue"><T k="govc.cc.how" /></summary>
        <p className="mt-1 max-w-3xl"><T k="govc.cc.howp" /></p>
      </details>
      <p className="mt-1"><a href={SRC} target="_blank" rel="noopener" className="inline-flex min-h-11 items-center text-sm font-semibold text-fiesta-blue underline"><T k="govc.cc.verify" /> ↗</a></p>
    </section>
  );
}
