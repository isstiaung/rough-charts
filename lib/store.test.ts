// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import {
  clearHistory,
  defaultSnapshot,
  editSignature,
  hydrateChartStore,
  redo,
  undo,
  useChartStore,
} from "./store";

const STORAGE_KEY = "hand-drawn-charts-storage";

describe("chart store", () => {
  beforeEach(() => {
    useChartStore.getState().resetToDefaults();
    clearHistory();
  });

  it("addSeries appends a name and pads every row with 0", () => {
    const { addSeries } = useChartStore.getState();
    const before = useChartStore.getState();
    addSeries();
    const after = useChartStore.getState();

    expect(after.seriesNames).toHaveLength(before.seriesNames.length + 1);
    for (const row of after.rows) {
      expect(row.values).toHaveLength(after.seriesNames.length);
      expect(row.values[row.values.length - 1]).toBe(0);
    }
  });

  it("deleteSeries removes the name and that column from every row", () => {
    useChartStore.getState().deleteSeries(0);
    const state = useChartStore.getState();

    expect(state.seriesNames).toEqual(["Reality"]);
    for (const row of state.rows) {
      expect(row.values).toHaveLength(1);
    }
  });

  it("addRow appends a row sized to the current series count", () => {
    const { addRow } = useChartStore.getState();
    addRow();
    const state = useChartStore.getState();
    const lastRow = state.rows[state.rows.length - 1];

    expect(lastRow.values).toEqual(new Array(state.seriesNames.length).fill(0));
  });

  it("setCellValue updates only the targeted cell", () => {
    useChartStore.getState().setCellValue(1, 1, 99);
    const state = useChartStore.getState();

    expect(state.rows[1].values[1]).toBe(99);
    expect(state.rows[0].values).toEqual([10, 20]);
  });

  it("importCsvData replaces series and rows", () => {
    useChartStore.getState().importCsvData(["A", "B"], ["S1"], [[1], [2]]);
    const state = useChartStore.getState();

    expect(state.seriesNames).toEqual(["S1"]);
    expect(state.rows).toEqual([
      { label: "A", values: [1] },
      { label: "B", values: [2] },
    ]);
  });

  it("importCsvData pads rows with missing data to the series count", () => {
    useChartStore.getState().importCsvData(["A", "B"], ["S1", "S2"], [[1]]);
    const { rows } = useChartStore.getState();
    expect(rows[0].values).toEqual([1, 0]);
    expect(rows[1].values).toEqual([0, 0]);
  });

  it("setCellValue clamps values that would overflow the axis", () => {
    useChartStore.getState().setCellValue(0, 0, 1e300);
    expect(useChartStore.getState().rows[0].values[0]).toBe(1e15);
  });

  it("regenerateSeed produces a positive seed", () => {
    useChartStore.getState().regenerateSeed();
    expect(useChartStore.getState().seed).toBeGreaterThan(0);
  });

  it("resetToDefaults restores the sample data", () => {
    useChartStore.getState().setTitle("Changed");
    useChartStore.getState().deleteRow(0);
    useChartStore.getState().resetToDefaults();
    const state = useChartStore.getState();

    expect(state.title).toBe("Title");
    expect(state.rows).toHaveLength(4);
  });
});

describe("undo history", () => {
  beforeEach(() => {
    useChartStore.getState().resetToDefaults();
    clearHistory();
  });

  it("undoes and redoes a change", () => {
    useChartStore.getState().setChartType("line");
    undo();
    expect(useChartStore.getState().chartType).toBe("grouped-bar");
    redo();
    expect(useChartStore.getState().chartType).toBe("line");
  });

  it("collapses a burst of edits to one cell into a single step", () => {
    const { setCellValue } = useChartStore.getState();
    setCellValue(0, 0, 1);
    setCellValue(0, 0, 12);
    setCellValue(0, 0, 123);
    undo();
    expect(useChartStore.getState().rows[0].values[0]).toBe(10);
  });

  it("keeps edits to different cells as separate steps", () => {
    const { setCellValue } = useChartStore.getState();
    setCellValue(0, 0, 1);
    setCellValue(1, 0, 2);
    undo();
    const { rows } = useChartStore.getState();
    expect(rows[0].values[0]).toBe(1);
    expect(rows[1].values[0]).toBe(20);
  });

  it("never merges structural changes", () => {
    const { addRow } = useChartStore.getState();
    addRow();
    addRow();
    undo();
    expect(useChartStore.getState().rows).toHaveLength(5);
  });

  it("starts a new step for the same field after an undo", () => {
    const { setTitle } = useChartStore.getState();
    setTitle("A");
    undo();
    setTitle("B");
    undo();
    expect(useChartStore.getState().title).toBe("Title");
  });

  it("makes reset undoable", () => {
    useChartStore.getState().setTitle("Mine");
    useChartStore.getState().resetToDefaults();
    undo();
    expect(useChartStore.getState().title).toBe("Mine");
  });
});

describe("editSignature", () => {
  it("names single-field text and slider edits", () => {
    expect(
      editSignature(defaultSnapshot, { ...defaultSnapshot, title: "x" })
    ).toBe("title");
    expect(
      editSignature(defaultSnapshot, { ...defaultSnapshot, roughness: 2 })
    ).toBe("roughness");
  });

  it("returns null for discrete choices", () => {
    expect(
      editSignature(defaultSnapshot, { ...defaultSnapshot, seed: 7 })
    ).toBeNull();
    expect(
      editSignature(defaultSnapshot, { ...defaultSnapshot, chartType: "line" })
    ).toBeNull();
  });
});

describe("persistence", () => {
  beforeEach(() => {
    localStorage.clear();
    useChartStore.getState().resetToDefaults();
  });

  it("loads an unversioned save from before history existed", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: { ...defaultSnapshot, title: "Old save" },
        version: 0,
      })
    );
    await hydrateChartStore();
    expect(useChartStore.getState().title).toBe("Old save");
    expect(useChartStore.temporal.getState().pastStates).toHaveLength(0);
  });

  it("repairs a corrupted save instead of crashing", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        state: {
          ...defaultSnapshot,
          seriesNames: ["A", "B"],
          rows: [{ label: "x", values: [1] }],
          chartType: "pie",
        },
        version: 1,
      })
    );
    await hydrateChartStore();
    const state = useChartStore.getState();
    expect(state.rows).toEqual([{ label: "x", values: [1, 0] }]);
    expect(state.chartType).toBe("grouped-bar");
  });

  it("keeps the defaults when the save is unusable", async () => {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ state: { rows: "nope" }, version: 1 })
    );
    await hydrateChartStore();
    expect(useChartStore.getState().rows).toEqual(defaultSnapshot.rows);
  });
});
