/** WMO weather code (Open-Meteo `weather_code`) to a dictionary key. Unknown codes return undefined so the page shows no label rather than a wrong one. */
export function weatherKey(code: number): string | undefined {
  if (code === 0) return "wx.clear";
  if (code === 1 || code === 2) return "wx.partly";
  if (code === 3) return "wx.cloudy";
  if (code === 45 || code === 48) return "wx.fog";
  if (code >= 51 && code <= 57) return "wx.drizzle";
  if ((code >= 61 && code <= 67)) return "wx.rain";
  if (code >= 80 && code <= 82) return "wx.showers";
  if (code >= 95 && code <= 99) return "wx.storm";
  return undefined;
}
