// @vitest-environment jsdom
import { describe, it, expect, beforeEach } from "vitest";
import { useChartStore } from "./store";

describe("chart store", () => {
  beforeEach(() => {
    useChartStore.getState().resetToDefaults();
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

    expect(lastRow.values).toEqual(
      new Array(state.seriesNames.length).fill(0)
    );
  });

  it("setCellValue updates only the targeted cell", () => {
    useChartStore.getState().setCellValue(1, 1, 99);
    const state = useChartStore.getState();

    expect(state.rows[1].values[1]).toBe(99);
    expect(state.rows[0].values).toEqual([10, 20]);
  });

  it("importCsvData replaces series and rows", () => {
    useChartStore
      .getState()
      .importCsvData(["A", "B"], ["S1"], [[1], [2]]);
    const state = useChartStore.getState();

    expect(state.seriesNames).toEqual(["S1"]);
    expect(state.rows).toEqual([
      { label: "A", values: [1] },
      { label: "B", values: [2] },
    ]);
  });

  it("importCsvData pads rows with missing data arrays", () => {
    useChartStore.getState().importCsvData(["A", "B"], ["S1"], [[1]]);
    expect(useChartStore.getState().rows[1].values).toEqual([]);
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
