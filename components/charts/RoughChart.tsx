"use client";

import { useEffect, useRef, memo } from "react";
import rough from "roughjs";
import { scaleLinear } from "d3-scale";
import {
  FONT_FAMILY,
  TICK_FONT_SIZE,
  Y_TICK_GAP,
  Y_TITLE_SPACE,
  margin,
} from "./shared/config";
import { seriesColor } from "./shared/colors";
import { xLabelLayout } from "./shared/drawAxis";
import { drawChartChrome } from "./shared/chrome";
import { drawLegend, LEGEND_HEIGHT } from "./shared/drawLegend";
import { tickFormatter } from "./shared/format";
import { addRowTargets } from "./shared/rowTargets";
import { fittedDomain, paddedDomain } from "./shared/scales";
import { Sketch } from "./shared/sketch";
import { measureTextWidths, svgNode } from "./shared/svg";
import { groupedBar } from "./renderers/groupedBar";
import { stackedBar } from "./renderers/stackedBar";
import { line } from "./renderers/line";
import type { ChartRenderer, Plot } from "./renderers/types";
import type { ChartType, DataRow, FillStyle, TooltipData } from "@/lib/types";

const renderers: Record<ChartType, ChartRenderer> = {
  "grouped-bar": groupedBar,
  "stacked-bar": stackedBar,
  line,
};

const chartTypeNames: Record<ChartType, string> = {
  "grouped-bar": "Grouped bar chart",
  "stacked-bar": "Stacked bar chart",
  line: "Line chart",
};

const Y_TICK_COUNT = 5;

interface Props {
  chartType: ChartType;
  width: number;
  height: number;
  rows: DataRow[];
  seriesNames: string[];
  title: string;
  xLabel: string;
  yLabel: string;
  roughness: number;
  fillStyle: FillStyle;
  seed: number;
  /** Text is measured for layout, so redraw once the chart font arrives */
  fontLoaded: boolean;
  onShowTooltip: (data: TooltipData) => void;
  onHideTooltip: () => void;
}

function RoughChart({
  chartType,
  width,
  height,
  rows,
  seriesNames,
  title,
  xLabel,
  yLabel,
  roughness,
  fillStyle,
  seed,
  fontLoaded,
  onShowTooltip,
  onHideTooltip,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || width <= 0) return;

    // The hover targets are being replaced, and they can't fire their own
    // pointerleave once removed
    onHideTooltip();
    svg.replaceChildren();
    if (rows.length === 0 || seriesNames.length === 0) return;

    const renderer = renderers[chartType];
    const values = renderer.yValues(rows);
    const yScale = scaleLinear().domain(
      renderer.zeroBaseline ? paddedDomain(values) : fittedDomain(values)
    );
    if (!renderer.zeroBaseline) yScale.nice(Y_TICK_COUNT);
    const yTicks = yScale.ticks(Y_TICK_COUNT);
    const formatTick = tickFormatter(yScale, Y_TICK_COUNT);

    // Visual layer; screen readers get the row targets added below instead
    const art = svgNode("g", { "aria-hidden": "true" });
    svg.appendChild(art);

    // Widen the left margin to fit the y tick labels, so large numbers never
    // run into the y axis title
    const tickLabelWidth = Math.max(
      0,
      ...measureTextWidths(
        art,
        yTicks.map(formatTick),
        FONT_FAMILY,
        TICK_FONT_SIZE
      )
    );
    const left = Math.max(
      margin.left,
      Math.ceil(Y_TITLE_SPACE + tickLabelWidth + Y_TICK_GAP)
    );
    const plotWidth = width - left - margin.right;
    // Rotated x labels need extra room so they clear the axis title
    const labelLayout = xLabelLayout(
      rows.map((r) => r.label),
      plotWidth
    );
    const plot: Plot = {
      left,
      top: margin.top,
      width: plotWidth,
      height: height - margin.top - margin.bottom - labelLayout.extraHeight,
    };
    if (plot.width <= 0 || plot.height <= 0) return;
    yScale.range([plot.top + plot.height, plot.top]);

    const sketch = new Sketch(rough.svg(svg), seed);

    const xCenters = renderer.draw({
      sketch,
      root: art,
      plot,
      rows,
      seriesNames,
      roughness,
      fillStyle,
      yScale,
      yTicks,
      formatTick,
      rotateXLabels: labelLayout.rotate,
    });

    drawChartChrome({ root: art, width, height, title, xLabel, yLabel });

    const legendHeight = drawLegend({
      sketch,
      root: art,
      items: seriesNames.map((name, i) => ({
        color: seriesColor(i),
        label: name,
      })),
      x: width / 2,
      y: height + 5,
      maxWidth: width - 20,
      fillStyle,
      roughness,
    });

    addRowTargets({
      svg,
      plot,
      xCenters,
      rows,
      seriesNames,
      onShowTooltip,
      onHideTooltip,
    });

    // Legend wraps to multiple rows, so the svg height is only known now
    svg.setAttribute("height", String(height + legendHeight + 10));
  }, [
    chartType,
    width,
    height,
    rows,
    seriesNames,
    title,
    xLabel,
    yLabel,
    roughness,
    fillStyle,
    seed,
    fontLoaded,
    onShowTooltip,
    onHideTooltip,
  ]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height + LEGEND_HEIGHT}
      role="group"
      aria-label={`${chartTypeNames[chartType]}${title ? `: ${title}` : ""}`}
    />
  );
}

export default memo(RoughChart);
