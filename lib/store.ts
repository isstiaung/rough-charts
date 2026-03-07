import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { ChartStore, ChartType, FillStyle } from "./types";

const defaultState = {
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
  chartType: "grouped-bar" as ChartType,
  roughness: 1.5,
  fillStyle: "hachure" as FillStyle,
};

export const useChartStore = create<ChartStore>()(
  persist(
    (set) => ({
      ...defaultState,

      setTitle: (title) => set({ title }),
      setXLabel: (xLabel) => set({ xLabel }),
      setYLabel: (yLabel) => set({ yLabel }),
      setChartType: (chartType) => set({ chartType }),
      setRoughness: (roughness) => set({ roughness }),
      setFillStyle: (fillStyle) => set({ fillStyle }),

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
            values[colIndex] = value;
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
        set({
          seriesNames,
          rows: labels.map((label, i) => ({
            label,
            values: data[i] || [],
          })),
        }),

      resetToDefaults: () => set(defaultState),
    }),
    {
      name: "hand-drawn-charts-storage",
      skipHydration: true,
    }
  )
);
