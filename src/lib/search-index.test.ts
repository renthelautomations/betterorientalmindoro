import { describe, it, expect } from "vitest";
import { getSearchItems } from "./search-index";
import { getMunicipalities } from "./municipalities";
import { getServices } from "./services";
import { getHotlines } from "./hotlines";

describe("search index", () => {
  const items = getSearchItems();
  it("covers every bayan, service and hotline", () => {
    expect(items.filter((i) => i.type === "bayan")).toHaveLength(getMunicipalities().length);
    expect(items.filter((i) => i.type === "serbisyo")).toHaveLength(getServices().length);
    expect(items.filter((i) => i.type === "hotline")).toHaveLength(getHotlines().length);
  });
  it("bayan link to their page and hotlines to tel:", () => {
    expect(items.find((i) => i.type === "bayan" && i.title === "Baco")?.href).toBe("/bayan/baco");
    for (const h of items.filter((i) => i.type === "hotline")) expect(h.href).toMatch(/^tel:\+?\d/);
  });
  it("every item has a title and an href", () => {
    for (const i of items) { expect(i.title).toBeTruthy(); expect(i.href).toBeTruthy(); }
  });
});
