import { format, precisionRound } from "d3-format";
import type { ScaleLinear } from "d3-scale";

function tidy(label: string): string {
  return (
    label
      // d3 emits U+2212 for minus, which the chart font lacks
      .replace("−", "-")
      .replace(/k$/, "K")
      .replace(/G$/, "B")
  );
}

/**
 * Y tick labels: abbreviated ("500K", "1.5M") once values reach five digits so
 * labels stay narrow, plain numbers below that. Precision follows the tick
 * step, so neighbouring ticks never format identically.
 */
export function tickFormatter(
  scale: ScaleLinear<number, number>,
  count: number
): (value: number) => string {
  const [lo, hi] = scale.domain();
  const max = Math.max(Math.abs(lo), Math.abs(hi));
  if (max < 10_000) {
    const plain = scale.tickFormat(count, ",~f");
    return (value) => tidy(plain(value));
  }

  // Unlike scale.tickFormat's "s", this picks a suffix per value ("500K",
  // "1M") rather than one shared suffix ("0.5M", "1M")
  const ticks = scale.ticks(count);
  const step = ticks.length > 1 ? Math.abs(ticks[1] - ticks[0]) : max;
  const abbreviated = format(`.${precisionRound(step, max)}~s`);
  return (value) => tidy(abbreviated(value));
}

const valueFormat = new Intl.NumberFormat(undefined, {
  maximumFractionDigits: 6,
});

/** Full-precision value for tooltips and screen readers */
export function formatValue(value: number): string {
  return valueFormat.format(value);
}
