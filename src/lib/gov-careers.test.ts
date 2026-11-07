import { describe, expect, it } from "vitest";
import { daysLeft, isOpen, filterCareers, pageOf } from "./gov-careers";
import type { Career } from "./gov";

const c = (id: string, deadline: string | null, office = "A", position = "Nurse"): Career => ({ id, position, itemNo: null, salaryGrade: null, monthlySalary: null, education: null, training: null, experience: null, eligibility: null, competency: null, office, deadline, url: null });
const items = [c("1", "2026-11-08"), c("2", "2026-11-07", "B"), c("3", "2026-12-01", "A", "Engineer"), c("4", null)];

describe("careers", () => {
  it("is open on the deadline day and after, closed before, closed with no deadline", () => {
    expect(isOpen("2026-11-08", "2026-11-08")).toBe(true);
    expect(isOpen("2026-11-07", "2026-11-08")).toBe(false);
    expect(isOpen(null, "2026-11-08")).toBe(false);
  });
  it("counts whole days left", () => {
    expect(daysLeft("2026-11-08", "2026-11-08")).toBe(0);
    expect(daysLeft("2026-12-01", "2026-11-08")).toBe(23);
  });
  it("filters by status, office and text with counts", () => {
    const today = "2026-11-08";
    expect(filterCareers(items, { status: "open", office: "", q: "", today }).rows.map((x) => x.id)).toEqual(["1", "3"]);
    expect(filterCareers(items, { status: "closed", office: "", q: "", today }).rows.map((x) => x.id)).toEqual(["2", "4"]);
    expect(filterCareers(items, { status: "all", office: "A", q: "engin", today }).rows.map((x) => x.id)).toEqual(["3"]);
    expect(filterCareers(items, { status: "all", office: "", q: "", today }).counts).toEqual({ open: 2, closed: 2, all: 4 });
  });
  it("pages ten at a time", () => {
    const xs = Array.from({ length: 25 }, (_, i) => i);
    expect(pageOf(xs, 3, 10).rows).toHaveLength(5);
    expect(pageOf(xs, 9, 10)).toMatchObject({ page: 3, last: 3 });
  });
});
