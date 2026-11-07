"use client";
import { useT } from "@/lib/i18n/i18n";

/** GET form: <select name=bayan> that submits on change; the Go button covers no-JS. */
export default function TownSelect({ towns, current }: { towns: { slug: string; name: string }[]; current?: string }) {
  const t = useT();
  return (
    <form action="/hotlines" method="get" className="flex flex-wrap items-end gap-3">
      <label className="text-sm font-semibold">
        <span className="mb-1 block">{t("dyn.hotline.pick")}</span>
        <select name="bayan" defaultValue={current ?? ""} onChange={(e) => e.currentTarget.form?.requestSubmit()} className="min-h-11 w-64 max-w-full rounded-xl border-2 border-fiesta-navy/20 bg-white px-3 text-base font-normal">
          <option value="">{t("dyn.province")}</option>
          {towns.map((m) => <option key={m.slug} value={m.slug}>{m.name}</option>)}
        </select>
      </label>
      <button type="submit" className="min-h-11 rounded-xl bg-fiesta-navy px-5 text-sm font-semibold text-white hover:bg-fiesta-blue">{t("dyn.hotline.go")}</button>
    </form>
  );
}
