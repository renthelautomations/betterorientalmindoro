"use client";
import { useT } from "@/lib/i18n/i18n";

/** Custom page box. The label and button text are translated, so this part is a client component. */
export function PageInput({ last }: { last: number }) {
  const t = useT();
  return (
    <>
      <label className="sr-only" htmlFor="pg">{t("proyekto.page.go")}</label>
      <input id="pg" name="page" type="number" inputMode="numeric" min={1} max={last} required placeholder={t("proyekto.page.of")} className="min-h-11 w-24 rounded-lg border border-black/25 bg-white px-3 text-sm tabular-nums outline-none focus:border-fiesta-blue" />
      <button className="min-h-11 rounded-lg bg-fiesta-navy px-4 text-sm font-semibold text-white hover:bg-fiesta-blue">{t("proyekto.page.gobtn")}</button>
    </>
  );
}
