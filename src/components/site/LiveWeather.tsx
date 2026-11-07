"use client";
import { useEffect, useState } from "react";
import KitIcon from "@/components/kit/KitIcon";
import { T, useT } from "@/lib/i18n/i18n";
import { weatherKey } from "@/lib/weather";

type Now = { temp: number; hum: number; wind: number; code: number };

/** Live conditions for Calapan City from Open-Meteo (no key, no account). If the request fails it says so; it never shows an invented reading. */
export default function LiveWeather() {
  const t = useT();
  const [w, setW] = useState<Now | null | "err">(null);
  useEffect(() => {
    const c = new AbortController();
    fetch("https://api.open-meteo.com/v1/forecast?latitude=13.41&longitude=121.18&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code", { signal: c.signal })
      .then((r) => r.json())
      .then((d) => setW({ temp: d.current.temperature_2m, hum: d.current.relative_humidity_2m, wind: d.current.wind_speed_10m, code: d.current.weather_code }))
      .catch((e) => { if (e?.name !== "AbortError") setW("err"); });
    return () => c.abort();
  }, []);
  const key = w && w !== "err" ? weatherKey(w.code) : undefined;
  const chip = (icon: "drop" | "weather", value: string, label: string) => (
    <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-4 py-3">
      <KitIcon name={icon} color="#fff" className="h-6 w-6 shrink-0" />
      <span><dd className="text-xl font-bold tabular-nums">{value}</dd><dt className="text-xs tracking-wide text-white uppercase">{label}</dt></span>
    </div>
  );
  return (
    <div className="flex-1">
      {w === "err" ? <p className="text-sm text-white">{t("home.wx.err")}</p> : !w ? <p className="text-sm text-white">{t("home.wx.load")}</p> : (
        <div className="flex h-full flex-col justify-between gap-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="flex items-start font-serif text-8xl font-bold leading-none tabular-nums">{Math.round(w.temp)}<span className="mt-2 text-4xl">°C</span></p>
              {key && <p className="mt-3 font-serif text-2xl font-bold"><T k={key} /></p>}
            </div>
            <KitIcon name="weather" color="#fff" className="h-16 w-16 shrink-0 opacity-90" />
          </div>
          <dl className="grid grid-cols-2 gap-3">
            {chip("drop", `${w.hum}%`, t("home.wx.hum"))}
            {chip("weather", String(w.wind), t("home.wx.kmh"))}
          </dl>
        </div>
      )}
    </div>
  );
}
