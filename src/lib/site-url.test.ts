import { describe, it, expect } from "vitest";
import { siteUrl } from "./site-url";

describe("siteUrl", () => {
  it("prefers NEXT_PUBLIC_SITE_URL", () => {
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://example.org", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" })).toBe("https://example.org");
  });
  it("falls back to the Vercel production URL over https", () => {
    expect(siteUrl({ VERCEL_PROJECT_PRODUCTION_URL: "betterorientalmindoro.vercel.app" })).toBe("https://betterorientalmindoro.vercel.app");
  });
  it("uses localhost only when nothing else is set, and drops a trailing slash", () => {
    expect(siteUrl({})).toBe("http://localhost:3000");
    expect(siteUrl({ NEXT_PUBLIC_SITE_URL: "https://example.org/" })).toBe("https://example.org");
  });
});
