import { getProvince } from "@/lib/dynasties";
import { T } from "@/lib/i18n/i18n";

export default function Attribution() {
  const p = getProvince();
  return (
    <footer className="mt-12 rounded-xl border border-black/10 bg-white p-4 text-xs leading-relaxed text-black/60">
      <p>
        <b>Source:</b> Election results from{" "}
        <a className="underline" href="https://robertrleung.github.io/OpenHalalan/" rel="noopener">Open Halalan</a> (Leung, Robert R.); poverty incidence from PSA; surname analysis from{" "}
        <a className="underline" href="https://dynasties.bettergov.ph/" rel="noopener">BetterGov Dynasties</a>. Data as of {p.vintage}.
      </p>
      <p className="mt-1">{p.license}</p>
      <p className="mt-1"><T k="dyn.attr.notgov" /></p>
    </footer>
  );
}
