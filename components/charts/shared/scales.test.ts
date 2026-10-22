import { describe, it, expect } from "vitest";
import {
  fittedDomain,
  paddedDomain,
  stackSegments,
  stackTotals,
} from "./scales";

describe("paddedDomain", () => {
  it("pads a positive-only domain and anchors it at zero", () => {
    expect(paddedDomain([10, 20, 40])).toEqual([0, 46]);
  });

  it("handles negative-only data", () => {
    const [lo, hi] = paddedDomain([-10, -20]);
    expect(lo).toBeCloseTo(-23);
    expect(hi).toBe(0);
  });

  it("handles mixed data", () => {
    const [lo, hi] = paddedDomain([-10, 20]);
    expect(lo).toBeCloseTo(-11.5);
    expect(hi).toBeCloseTo(23);
  });

  it("falls back to [0, 10] for all-zero data", () => {
    expect(paddedDomain([0, 0])).toEqual([0, 10]);
    expect(paddedDomain([])).toEqual([0, 10]);
  });
});

describe("stackSegments", () => {
  it("stacks positive values upward from zero", () => {
    expect(stackSegments([10, 20, 5])).toEqual([
      { start: 0, end: 10 },
      { start: 10, end: 30 },
      { start: 30, end: 35 },
    ]);
  });

  it("stacks negative values downward from zero", () => {
    expect(stackSegments([-10, -5])).toEqual([
      { start: -10, end: 0 },
      { start: -15, end: -10 },
    ]);
  });

  it("stacks mixed values in both directions", () => {
    expect(stackSegments([10, -5, 20, -10])).toEqual([
      { start: 0, end: 10 },
      { start: -5, end: 0 },
      { start: 10, end: 30 },
      { start: -15, end: -5 },
    ]);
  });

  it("keeps start <= end for every segment", () => {
    for (const segment of stackSegments([3, -7, 0, 12, -1])) {
      expect(segment.start).toBeLessThanOrEqual(segment.end);
    }
  });
});

describe("stackTotals", () => {
  it("sums positives and negatives separately", () => {
    expect(stackTotals([10, -5, 20, -10])).toEqual([30, -15]);
  });

  it("handles all-positive rows", () => {
    expect(stackTotals([1, 2, 3])).toEqual([6, 0]);
  });
});

describe("fittedDomain", () => {
  it("fits the data range instead of anchoring at zero", () => {
    const [lo, hi] = fittedDomain([980, 1000]);
    expect(lo).toBeCloseTo(978);
    expect(hi).toBeCloseTo(1002);
  });

  it("pads a flat series so it isn't drawn on the edge", () => {
    expect(fittedDomain([50, 50])).toEqual([45, 55]);
    expect(fittedDomain([0, 0])).toEqual([-1, 1]);
  });

  it("falls back to [0, 10] without data", () => {
    expect(fittedDomain([])).toEqual([0, 10]);
  });
});
