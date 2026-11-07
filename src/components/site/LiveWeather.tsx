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
  return (
    <div className="min-h-44">
      {w === "err" ? <p className="text-sm text-white/80">{t("home.wx.err")}</p> : !w ? <p className="text-sm text-white/80">{t("home.wx.load")}</p> : (
        <div className="flex flex-wrap items-center gap-x-8 gap-y-4">
          <div>
            <p className="flex items-start font-serif text-7xl font-bold leading-none tabular-nums">{Math.round(w.temp)}<span className="mt-1 text-3xl">°C</span></p>
            {key && <p className="mt-2 text-lg font-semibold"><T k={key} /></p>}
          </div>
          <dl className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><KitIcon name="drop" color="#fff" className="h-5 w-5" /></span><span><dd className="text-lg font-bold tabular-nums">{w.hum}%</dd><dt className="text-xs tracking-wide text-white/80 uppercase">{t("home.wx.hum")}</dt></span></div>
            <div className="flex items-center gap-2.5"><span className="flex h-10 w-10 items-center justify-center rounded-full bg-white/15"><KitIcon name="weather" color="#fff" className="h-5 w-5" /></span><span><dd className="text-lg font-bold tabular-nums">{w.wind}</dd><dt className="text-xs tracking-wide text-white/80 uppercase">{t("home.wx.kmh")}</dt></span></div>
          </dl>
        </div>
      )}
    </div>
  );
}
