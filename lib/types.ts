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

export type ChartType = "grouped-bar" | "stacked-bar" | "line";

export type FillStyle =
  | "hachure"
  | "solid"
  | "zigzag"
  | "cross-hatch"
  | "dots"
  | "dashed"
  | "zigzag-line";

export interface ChartOptions {
  roughness: number;
  fillStyle: FillStyle;
  chartType: ChartType;
}

export interface ChartStore extends ChartData, ChartOptions {
  setTitle: (title: string) => void;
  setXLabel: (xLabel: string) => void;
  setYLabel: (yLabel: string) => void;
  setChartType: (chartType: ChartType) => void;
  setRoughness: (roughness: number) => void;
  setFillStyle: (fillStyle: FillStyle) => void;
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
  resetToDefaults: () => void;
}
