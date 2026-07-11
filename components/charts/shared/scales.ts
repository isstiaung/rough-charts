import { max, min } from "d3-array";

/**
 * Y domain covering the data with headroom, always anchored to zero so
 * bars have a baseline. Supports all-positive, all-negative, and mixed data.
 */
export function paddedDomain(values: number[]): [number, number] {
  const lo = Math.min(0, min(values) ?? 0);
  const hi = Math.max(0, max(values) ?? 0);
  if (lo === 0 && hi === 0) return [0, 10];
  return [lo * 1.15, hi * 1.15];
}

export interface StackSegment {
  start: number;
  end: number;
}

/**
 * Diverging stack: positive values accumulate upward from zero,
 * negative values accumulate downward. `start` <= `end` for every segment.
 */
export function stackSegments(values: number[]): StackSegment[] {
  let positive = 0;
  let negative = 0;
  return values.map((value) => {
    if (value >= 0) {
      const segment = { start: positive, end: positive + value };
      positive += value;
      return segment;
    }
    const segment = { start: negative + value, end: negative };
    negative += value;
    return segment;
  });
}

/** Per-row stacked extremes: [positive total, negative total]. */
export function stackTotals(values: number[]): [number, number] {
  let positive = 0;
  let negative = 0;
  for (const value of values) {
    if (value >= 0) positive += value;
    else negative += value;
  }
  return [positive, negative];
}
