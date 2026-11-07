"use client";
import { useEffect, useState } from "react";
import { useT } from "@/lib/i18n/i18n";

// Open-Meteo, Calapan City. Falls back to text if the request fails.
export default function WeatherNow() {
  const tr = useT();
  const [t, setT] = useState<{ temp: number; wind: number } | null | "err">(null);
  useEffect(() => {
    fetch("https://api.open-meteo.com/v1/forecast?latitude=13.41&longitude=121.18&current=temperature_2m,wind_speed_10m")
      .then((r) => r.json())
      .then((d) => setT({ temp: d.current.temperature_2m, wind: d.current.wind_speed_10m }))
      .catch(() => setT("err"));
  }, []);
  if (t === "err") return <p className="text-sm text-black/60">{tr("home.wx.err")}</p>;
  if (!t) return <p className="text-sm text-black/60">{tr("home.wx.load")}</p>;
  return <p className="text-sm">{tr("home.wx.now")} <b>{t.temp}°C</b>, {tr("home.wx.wind")} {t.wind} km/h. <span className="text-black/60">{tr("common.source")}: Open-Meteo.</span></p>;
}
