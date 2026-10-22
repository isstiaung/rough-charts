import {
  CHART_TYPES,
  FILL_STYLES,
  type ChartSnapshot,
  type ChartType,
  type DataRow,
  type FillStyle,
} from "./types";

/** Caps that keep untrusted input (share links, old saves, big CSVs) renderable. */
export const LIMITS = {
  rows: 1000,
  series: 50,
  textLength: 200,
  /** Beyond this, padded axis domains overflow to Infinity */
  absValue: 1e15,
} as const;

export function clampValue(value: number): number {
  return Math.min(Math.max(value, -LIMITS.absValue), LIMITS.absValue);
}

export function pickSnapshot(state: ChartSnapshot): ChartSnapshot {
  const {
    title,
    xLabel,
    yLabel,
    seriesNames,
    rows,
    chartType,
    roughness,
    fillStyle,
    seed,
  } = state;
  return {
    title,
    xLabel,
    yLabel,
    seriesNames,
    rows,
    chartType,
    roughness,
    fillStyle,
    seed,
  };
}

function text(value: unknown, fallback: string): string {
  return typeof value === "string"
    ? value.slice(0, LIMITS.textLength)
    : fallback;
}

function numberValue(value: unknown): number {
  return typeof value === "number" && Number.isFinite(value)
    ? clampValue(value)
    : 0;
}

/**
 * Coerces untrusted input (a saved session, a share link) into a valid chart:
 * rows are padded or trimmed to the series count, bad scalar fields fall back
 * to `fallback`. Returns null when there is no usable data at all.
 */
export function sanitizeSnapshot(
  input: unknown,
  fallback: ChartSnapshot
): ChartSnapshot | null {
  if (!input || typeof input !== "object") return null;
  const raw = input as Record<string, unknown>;
  if (!Array.isArray(raw.seriesNames) || !Array.isArray(raw.rows)) return null;

  const seriesNames = raw.seriesNames
    .slice(0, LIMITS.series)
    .map((name, i) => text(name, `Series ${i + 1}`));
  const rows: DataRow[] = raw.rows.slice(0, LIMITS.rows).map((row, i) => {
    const r = (row && typeof row === "object" ? row : {}) as Record<
      string,
      unknown
    >;
    const values = Array.isArray(r.values) ? r.values : [];
    return {
      label: text(r.label, `Row ${i + 1}`),
      values: seriesNames.map((_, s) => numberValue(values[s])),
    };
  });
  if (seriesNames.length === 0 || rows.length === 0) return null;

  const { roughness, seed } = raw;
  return {
    title: text(raw.title, fallback.title),
    xLabel: text(raw.xLabel, fallback.xLabel),
    yLabel: text(raw.yLabel, fallback.yLabel),
    seriesNames,
    rows,
    chartType: CHART_TYPES.includes(raw.chartType as ChartType)
      ? (raw.chartType as ChartType)
      : fallback.chartType,
    roughness:
      typeof roughness === "number" && Number.isFinite(roughness)
        ? Math.min(Math.max(roughness, 0), 4)
        : fallback.roughness,
    fillStyle: FILL_STYLES.includes(raw.fillStyle as FillStyle)
      ? (raw.fillStyle as FillStyle)
      : fallback.fillStyle,
    seed:
      typeof seed === "number" &&
      Number.isInteger(seed) &&
      seed > 0 &&
      seed < 2 ** 31
        ? seed
        : fallback.seed,
  };
}
