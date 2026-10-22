import { create } from "zustand";
import { persist } from "zustand/middleware";
import { temporal } from "zundo";
import { clampValue, pickSnapshot, sanitizeSnapshot } from "./snapshot";
import type { ChartSnapshot, ChartStore } from "./types";

export const defaultSnapshot: ChartSnapshot = {
  title: "Title",
  xLabel: "X Axis Label",
  yLabel: "Y Axis Label",
  seriesNames: ["Plan", "Reality"],
  rows: [
    { label: "Alan", values: [10, 20] },
    { label: "Chris", values: [20, 30] },
    { label: "Sai", values: [30, 40] },
    { label: "Test", values: [40, 80] },
  ],
  chartType: "grouped-bar",
  roughness: 1.5,
  fillStyle: "hachure",
  seed: 42,
};

/** Bump when the saved shape changes; `merge` below must accept older saves. */
const STORAGE_VERSION = 1;

const HISTORY_LIMIT = 100;
/** Edits to the same field closer together than this share one undo step */
const EDIT_MERGE_WINDOW_MS = 1000;

function randomSeed() {
  return Math.floor(Math.random() * 2 ** 31) + 1;
}

/**
 * Names an in-place edit (typing in one cell, dragging the roughness slider)
 * so a burst of them collapses into a single undo step. Returns null for
 * structural or discrete changes, which always get a step of their own.
 */
export function editSignature(
  past: ChartSnapshot,
  current: ChartSnapshot
): string | null {
  const changed = (Object.keys(current) as (keyof ChartSnapshot)[]).filter(
    (key) => past[key] !== current[key]
  );
  if (changed.length !== 1) return null;

  switch (changed[0]) {
    case "title":
    case "xLabel":
    case "yLabel":
    case "roughness":
      return changed[0];
    case "seriesNames": {
      if (past.seriesNames.length !== current.seriesNames.length) return null;
      const i = current.seriesNames.findIndex(
        (name, idx) => name !== past.seriesNames[idx]
      );
      return `series:${i}`;
    }
    case "rows": {
      if (past.rows.length !== current.rows.length) return null;
      const i = current.rows.findIndex((row, idx) => row !== past.rows[idx]);
      if (i < 0) return null;
      const before = past.rows[i];
      const after = current.rows[i];
      if (before.label !== after.label) return `label:${i}`;
      if (before.values.length !== after.values.length) return null;
      const j = after.values.findIndex((v, idx) => v !== before.values[idx]);
      return `cell:${i}:${j}`;
    }
    default:
      return null;
  }
}

let lastEdit: { signature: string; at: number } | null = null;
/** Set while an action replaces the chart wholesale, so it never merges */
let replacingChart = false;

export const useChartStore = create<ChartStore>()(
  persist(
    temporal(
      (set) => {
        const replaceChart = (snapshot: Partial<ChartSnapshot>) => {
          replacingChart = true;
          try {
            set(snapshot);
          } finally {
            replacingChart = false;
          }
        };

        return {
          ...defaultSnapshot,

          setTitle: (title) => set({ title }),
          setXLabel: (xLabel) => set({ xLabel }),
          setYLabel: (yLabel) => set({ yLabel }),
          setChartType: (chartType) => set({ chartType }),
          setRoughness: (roughness) => set({ roughness }),
          setFillStyle: (fillStyle) => set({ fillStyle }),
          regenerateSeed: () => set({ seed: randomSeed() }),

          setSeriesName: (index, name) =>
            set((state) => {
              const seriesNames = [...state.seriesNames];
              seriesNames[index] = name;
              return { seriesNames };
            }),

          setRowLabel: (rowIndex, label) =>
            set((state) => {
              const rows = state.rows.map((row, i) =>
                i === rowIndex ? { ...row, label } : row
              );
              return { rows };
            }),

          setCellValue: (rowIndex, colIndex, value) =>
            set((state) => {
              const rows = state.rows.map((row, i) => {
                if (i !== rowIndex) return row;
                const values = [...row.values];
                values[colIndex] = clampValue(value);
                return { ...row, values };
              });
              return { rows };
            }),

          addRow: () =>
            set((state) => ({
              rows: [
                ...state.rows,
                {
                  label: `Row ${state.rows.length + 1}`,
                  values: new Array(state.seriesNames.length).fill(0),
                },
              ],
            })),

          deleteRow: (index) =>
            set((state) => ({
              rows: state.rows.filter((_, i) => i !== index),
            })),

          addSeries: () =>
            set((state) => ({
              seriesNames: [
                ...state.seriesNames,
                `Series ${state.seriesNames.length + 1}`,
              ],
              rows: state.rows.map((row) => ({
                ...row,
                values: [...row.values, 0],
              })),
            })),

          deleteSeries: (index) =>
            set((state) => ({
              seriesNames: state.seriesNames.filter((_, i) => i !== index),
              rows: state.rows.map((row) => ({
                ...row,
                values: row.values.filter((_, i) => i !== index),
              })),
            })),

          importCsvData: (labels, seriesNames, data) =>
            replaceChart({
              seriesNames,
              rows: labels.map((label, i) => ({
                label,
                values: seriesNames.map((_, s) => data[i]?.[s] ?? 0),
              })),
            }),

          loadSnapshot: (snapshot) => replaceChart(snapshot),

          resetToDefaults: () => replaceChart(defaultSnapshot),
        };
      },
      {
        partialize: (state: ChartStore) => pickSnapshot(state),
        limit: HISTORY_LIMIT,
        handleSet: (handleSet) => (pastState, replace, currentState, delta) => {
          const signature = replacingChart
            ? null
            : editSignature(pastState as ChartSnapshot, currentState);
          const now = Date.now();
          const merge =
            signature !== null &&
            lastEdit?.signature === signature &&
            now - lastEdit.at < EDIT_MERGE_WINDOW_MS;
          lastEdit = signature ? { signature, at: now } : null;
          // zundo types handleSet as setState, but calls it with all four args
          if (!merge) {
            (handleSet as (...args: unknown[]) => void)(
              pastState,
              replace,
              currentState,
              delta
            );
          }
        },
      }
    ),
    {
      name: "hand-drawn-charts-storage",
      version: STORAGE_VERSION,
      skipHydration: true,
      partialize: pickSnapshot,
      // Unversioned (v0) saves hold the same fields; merge validates any version
      migrate: (persisted) => persisted as ChartSnapshot,
      merge: (persisted, current) => {
        const saved = sanitizeSnapshot(persisted, defaultSnapshot);
        return saved ? { ...current, ...saved } : current;
      },
    }
  )
);

export function undo() {
  lastEdit = null;
  useChartStore.temporal.getState().undo();
}

export function redo() {
  lastEdit = null;
  useChartStore.temporal.getState().redo();
}

export function clearHistory() {
  lastEdit = null;
  useChartStore.temporal.getState().clear();
}

/** Loads the saved chart from LocalStorage; history starts after it. */
export async function hydrateChartStore() {
  await useChartStore.persist.rehydrate();
  clearHistory();
}
