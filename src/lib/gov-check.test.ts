import { describe, expect, it } from "vitest";
import { crossCheck } from "./gov-check";

describe("crossCheck", () => {
  it("compares official facts with our boundary data", () => {
    const rows = crossCheck();
    console.log(JSON.stringify(rows, null, 1));
    expect(rows.map((r) => r.status)).not.toContain("unknown");
  });
  it("applies the 1% area tolerance", () => {
    const facts = [{ key: "areaKm2", label: "", value: 1000, unit: "sq km" }];
    const ours = { municipalities: 0, cities: 0, areaKm2: 1005, barangays: 0 };
    expect(crossCheck(facts, ours).find((r) => r.label.startsWith("Land area"))?.status).toBe("close");
    expect(crossCheck(facts, { ...ours, areaKm2: 1100 }).find((r) => r.label.startsWith("Land area"))?.status).toBe("differs");
    expect(crossCheck(facts, ours)[0].status).toBe("unknown");
  });
});
