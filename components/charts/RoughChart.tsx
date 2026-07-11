"use client";

import { useEffect, useRef, memo } from "react";
import rough from "roughjs";
import { margin } from "./shared/config";
import { seriesColor } from "./shared/colors";
import { xLabelLayout } from "./shared/drawAxis";
import { drawChartChrome } from "./shared/chrome";
import { drawLegend, LEGEND_HEIGHT } from "./shared/drawLegend";
import { renderGroupedBar } from "./renderers/groupedBar";
import { renderStackedBar } from "./renderers/stackedBar";
import { renderLine } from "./renderers/line";
import type { ChartRenderer } from "./renderers/types";
import type { ChartType, DataRow, FillStyle, TooltipData } from "@/lib/types";

const renderers: Record<ChartType, ChartRenderer> = {
  "grouped-bar": renderGroupedBar,
  "stacked-bar": renderStackedBar,
  line: renderLine,
};

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
  onShowTooltip,
  onHideTooltip,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || width <= 0 || rows.length === 0 || seriesNames.length === 0)
      return;

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const chartWidth = width - margin.left - margin.right;
    // Rotated x labels need extra room so they clear the axis title
    const labelLayout = xLabelLayout(
      rows.map((r) => r.label),
      chartWidth
    );
    const chartHeight =
      height - margin.top - margin.bottom - labelLayout.extraHeight;
    if (chartWidth <= 0 || chartHeight <= 0) return;

    // Fixed seed keeps strokes stable across re-renders instead of
    // re-randomizing on every unrelated edit
    const rc = rough.svg(svg, { options: { seed } });

    renderers[chartType]({
      rc,
      svg,
      chartWidth,
      chartHeight,
      rows,
      seriesNames,
      roughness,
      fillStyle,
      rotateXLabels: labelLayout.rotate,
      onShowTooltip,
      onHideTooltip,
    });

    drawChartChrome({ svg, width, height, title, xLabel, yLabel });

    const legendHeight = drawLegend({
      rc,
      svg,
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
    onShowTooltip,
    onHideTooltip,
  ]);

  return (
    <svg
      ref={svgRef}
      width={width}
      height={height + LEGEND_HEIGHT}
      role="img"
      aria-label={title ? `Chart: ${title}` : "Chart"}
    />
  );
}

export default memo(RoughChart);
