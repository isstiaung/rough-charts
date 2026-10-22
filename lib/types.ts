export interface DataRow {
  label: string;
  values: number[];
}

export interface ChartData {
  title: string;
  xLabel: string;
  yLabel: string;
  seriesNames: string[];
  rows: DataRow[];
}

export const CHART_TYPES = ["grouped-bar", "stacked-bar", "line"] as const;
export type ChartType = (typeof CHART_TYPES)[number];

export const FILL_STYLES = [
  "hachure",
  "solid",
  "zigzag",
  "cross-hatch",
  "dots",
  "dashed",
  "zigzag-line",
] as const;
export type FillStyle = (typeof FILL_STYLES)[number];

export interface ChartOptions {
  roughness: number;
  fillStyle: FillStyle;
  chartType: ChartType;
  /** roughjs seed so strokes stay stable across re-renders */
  seed: number;
}

/** Everything that defines a chart: what gets saved, shared, and undone. */
export type ChartSnapshot = ChartData & ChartOptions;

export interface TooltipData {
  x: number;
  y: number;
  label: string;
  items: { color: string; name: string; value: number }[];
}

export interface ChartStore extends ChartSnapshot {
  setTitle: (title: string) => void;
  setXLabel: (xLabel: string) => void;
  setYLabel: (yLabel: string) => void;
  setChartType: (chartType: ChartType) => void;
  setRoughness: (roughness: number) => void;
  setFillStyle: (fillStyle: FillStyle) => void;
  regenerateSeed: () => void;
  setSeriesName: (index: number, name: string) => void;
  setRowLabel: (rowIndex: number, label: string) => void;
  setCellValue: (rowIndex: number, colIndex: number, value: number) => void;
  addRow: () => void;
  deleteRow: (index: number) => void;
  addSeries: () => void;
  deleteSeries: (index: number) => void;
  importCsvData: (
    labels: string[],
    seriesNames: string[],
    data: number[][]
  ) => void;
  loadSnapshot: (snapshot: ChartSnapshot) => void;
  resetToDefaults: () => void;
}
