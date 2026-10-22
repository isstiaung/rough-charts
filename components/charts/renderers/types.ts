import type { ScaleLinear } from "d3-scale";
import type { DataRow, FillStyle } from "@/lib/types";
import type { Sketch } from "../shared/sketch";

/** The plot area, in absolute svg coordinates */
export interface Plot {
  left: number;
  top: number;
  width: number;
  height: number;
}

export interface RenderContext {
  sketch: Sketch;
  /** Layer to draw into */
  root: SVGElement;
  plot: Plot;
  rows: DataRow[];
  seriesNames: string[];
  roughness: number;
  fillStyle: FillStyle;
  /** Maps a data value to an absolute svg y */
  yScale: ScaleLinear<number, number>;
  yTicks: number[];
  formatTick: (value: number) => string;
  /** Precomputed by the chart so the plot area reserves space for it */
  rotateXLabels: boolean;
}

export interface ChartRenderer {
  /** Values the y axis must cover */
  yValues: (rows: DataRow[]) => number[];
  /** Bars need a zero baseline; lines fit the data's own range */
  zeroBaseline: boolean;
  /** Draws axes and marks; returns the x center of each row */
  draw: (ctx: RenderContext) => number[];
}
