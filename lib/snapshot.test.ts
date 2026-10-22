import { describe, it, expect } from "vitest";
import { LIMITS, sanitizeSnapshot } from "./snapshot";
import { defaultSnapshot } from "./store";

describe("sanitizeSnapshot", () => {
  it("passes a valid snapshot through unchanged", () => {
    expect(sanitizeSnapshot(defaultSnapshot, defaultSnapshot)).toEqual(
      defaultSnapshot
    );
  });

  it("returns null without series or rows", () => {
    expect(sanitizeSnapshot(null, defaultSnapshot)).toBeNull();
    expect(sanitizeSnapshot("chart", defaultSnapshot)).toBeNull();
    expect(
      sanitizeSnapshot({ seriesNames: [], rows: [] }, defaultSnapshot)
    ).toBeNull();
  });

  it("fixes malformed rows and values", () => {
    const result = sanitizeSnapshot(
      {
        seriesNames: ["A", 5],
        rows: [
          { label: "r1", values: [1, "2", 3] },
          { values: [Infinity] },
          "junk",
        ],
      },
      defaultSnapshot
    );
    expect(result?.seriesNames).toEqual(["A", "Series 2"]);
    expect(result?.rows).toEqual([
      { label: "r1", values: [1, 0] },
      { label: "Row 2", values: [0, 0] },
      { label: "Row 3", values: [0, 0] },
    ]);
  });

  it("falls back for invalid options", () => {
    const result = sanitizeSnapshot(
      {
        ...defaultSnapshot,
        chartType: "pie",
        fillStyle: "plaid",
        roughness: 99,
        seed: -1,
        title: { evil: true },
      },
      defaultSnapshot
    );
    expect(result).toMatchObject({
      chartType: defaultSnapshot.chartType,
      fillStyle: defaultSnapshot.fillStyle,
      roughness: 4,
      seed: defaultSnapshot.seed,
      title: defaultSnapshot.title,
    });
  });

  it("caps sizes", () => {
    const result = sanitizeSnapshot(
      {
        title: "x".repeat(5000),
        seriesNames: Array.from({ length: 80 }, (_, i) => `S${i}`),
        rows: Array.from({ length: 2000 }, () => ({ label: "r", values: [] })),
      },
      defaultSnapshot
    );
    expect(result?.title).toHaveLength(LIMITS.textLength);
    expect(result?.seriesNames).toHaveLength(LIMITS.series);
    expect(result?.rows).toHaveLength(LIMITS.rows);
  });
});
