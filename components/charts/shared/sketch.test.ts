import { describe, it, expect } from "vitest";
import { shapeSeed, withSeededRandom } from "./sketch";

describe("shapeSeed", () => {
  it("is deterministic and positive", () => {
    const seed = shapeSeed(42, "bar-0-1");
    expect(seed).toBe(shapeSeed(42, "bar-0-1"));
    expect(seed).toBeGreaterThan(0);
    expect(seed).toBeLessThan(2 ** 31);
  });

  it("differs across shapes and chart seeds", () => {
    const seeds = new Set(
      ["bar-0-0", "bar-0-1", "bar-1-0", "legend", "x-axis"].map((key) =>
        shapeSeed(42, key)
      )
    );
    expect(seeds.size).toBe(5);
    expect(shapeSeed(43, "bar-0-0")).not.toBe(shapeSeed(42, "bar-0-0"));
  });
});

describe("withSeededRandom", () => {
  it("makes Math.random repeatable inside and restores it after", () => {
    const original = Math.random;
    const a = withSeededRandom(7, () => [Math.random(), Math.random()]);
    const b = withSeededRandom(7, () => [Math.random(), Math.random()]);
    expect(a).toEqual(b);
    expect(Math.random).toBe(original);
  });

  it("restores Math.random when drawing throws", () => {
    const original = Math.random;
    expect(() =>
      withSeededRandom(7, () => {
        throw new Error("boom");
      })
    ).toThrow("boom");
    expect(Math.random).toBe(original);
  });
});
