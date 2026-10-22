import { describe, it, expect } from "vitest";
import { scaleLinear } from "d3-scale";
import { tickFormatter } from "./format";

function ticks(domain: [number, number]) {
  const scale = scaleLinear().domain(domain);
  const format = tickFormatter(scale, 5);
  return scale.ticks(5).map(format);
}

describe("tickFormatter", () => {
  it("abbreviates large values", () => {
    expect(ticks([0, 2_415_000])).toEqual(["0", "500K", "1M", "1.5M", "2M"]);
  });

  it("uses B for billions", () => {
    expect(ticks([0, 3e9])).toContain("3B");
  });

  it("keeps small values plain", () => {
    expect(ticks([0, 46])).toEqual(["0", "10", "20", "30", "40"]);
  });

  it("keeps enough decimals to tell fractional ticks apart", () => {
    expect(ticks([0, 0.023])).toEqual(["0", "0.005", "0.01", "0.015", "0.02"]);
  });

  it("uses an ASCII minus the chart font can draw", () => {
    expect(ticks([-11.5, 23])[0]).toBe("-10");
  });
});
