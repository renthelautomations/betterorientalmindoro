import { describe, it, expect } from "vitest";
import { numbers, tidy } from "./office-format";

describe("numbers", () => {
  it("keeps a single number whole", () => { expect(numbers("(043) 288 7333")).toEqual(["(043) 288 7333"]); expect(numbers("288-7333")).toEqual(["288-7333"]); });
  it("splits a mobile and a landline run together", () => expect(numbers("0917 190 8101 288-7819")).toEqual(["0917 190 8101", "288-7819"]));
  it("splits on a slash", () => expect(numbers("288-7250 / 288-7251")).toEqual(["288-7250", "288-7251"]));
  it("nothing in, nothing out", () => { expect(numbers(null)).toEqual([]); expect(numbers("")).toEqual([]); });
});
describe("tidy", () => {
  it("title-cases SHOUTED text", () => expect(tidy("CALAPAN CITY")).toBe("Calapan City"));
  it("leaves mixed case alone", () => expect(tidy("Capitol Complex, Calapan City")).toBe("Capitol Complex, Calapan City"));
});
