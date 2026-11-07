import { describe, it, expect } from "vitest";
import { weatherKey } from "./weather";

describe("weatherKey", () => {
  it("maps common WMO codes", () => {
    expect([0, 2, 3, 45, 53, 63, 81, 95].map(weatherKey)).toEqual(["wx.clear", "wx.partly", "wx.cloudy", "wx.fog", "wx.drizzle", "wx.rain", "wx.showers", "wx.storm"]);
  });
  it("unknown codes give no label", () => { expect(weatherKey(71)).toBeUndefined(); expect(weatherKey(-1)).toBeUndefined(); });
});
