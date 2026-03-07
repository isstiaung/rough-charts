"use client";

import { useEffect, useRef, memo } from "react";
import rough from "roughjs";
import { scaleBand, scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { margin, FONT_FAMILY } from "./shared/config";
import { chartColors } from "./shared/colors";
import { drawAxes } from "./shared/drawAxis";
import { drawLegend } from "./shared/drawLegend";
import type { DataRow, FillStyle } from "@/lib/types";
import type { TooltipData } from "../ChartCanvas";

interface Props {
  width: number;
  height: number;
  rows: DataRow[];
  seriesNames: string[];
  title: string;
  xLabel: string;
  yLabel: string;
  roughness: number;
  fillStyle: FillStyle;
  onShowTooltip: (data: TooltipData) => void;
  onHideTooltip: () => void;
}

function StackedBarChart({
  width,
  height,
  rows,
  seriesNames,
  title,
  xLabel,
  yLabel,
  roughness,
  fillStyle,
  onShowTooltip,
  onHideTooltip,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || width <= 0 || rows.length === 0 || seriesNames.length === 0)
      return;

    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    if (chartWidth <= 0 || chartHeight <= 0) return;

    const labels = rows.map((r) => r.label);
    const stackTotals = rows.map((r) =>
      r.values.reduce((sum, v) => sum + v, 0)
    );
    const maxVal = max(stackTotals) ?? 0;

    const xScale = scaleBand()
      .domain(labels)
      .range([0, chartWidth])
      .padding(0.3);
    const yScale = scaleLinear()
      .domain([0, maxVal > 0 ? maxVal * 1.15 : 10])
      .range([chartHeight, 0]);

    const yTicks = yScale.ticks(5);

    drawAxes({
      rc,
      svg,
      width,
      height,
      xScale: (label: string) => xScale(label),
      yScale: (val: number) => yScale(val),
      xLabels: labels,
      yTicks,
      xBandwidth: xScale.bandwidth(),
    });

    // Draw stacked bars
    rows.forEach((row) => {
      const x0 = xScale(row.label);
      if (x0 === undefined) return;

      let cumulative = 0;
      row.values.forEach((value, seriesIdx) => {
        const barX = margin.left + x0;
        const barWidth = xScale.bandwidth();
        const barBottom = margin.top + yScale(cumulative);
        const barTop = margin.top + yScale(cumulative + value);
        const barHeight = barBottom - barTop;

        if (barHeight > 0) {
          const rect = rc.rectangle(barX, barTop, barWidth, barHeight, {
            fill: chartColors[seriesIdx % chartColors.length],
            fillStyle,
            roughness,
            stroke: "black",
            strokeWidth: 1.5,
          });
          svg.appendChild(rect);

          // Invisible overlay for mouse events
          const overlay = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "rect"
          );
          overlay.setAttribute("x", String(barX));
          overlay.setAttribute("y", String(barTop));
          overlay.setAttribute("width", String(barWidth));
          overlay.setAttribute("height", String(barHeight));
          overlay.setAttribute("fill", "transparent");
          overlay.setAttribute("cursor", "pointer");
          overlay.addEventListener("mouseenter", (e) => {
            onShowTooltip({
              x: (e as MouseEvent).offsetX,
              y: (e as MouseEvent).offsetY,
              label: row.label,
              items: row.values.map((v, si) => ({
                color: chartColors[si % chartColors.length],
                name: seriesNames[si] ?? `Series ${si + 1}`,
                value: v,
              })),
            });
          });
          overlay.addEventListener("mouseleave", onHideTooltip);
          svg.appendChild(overlay);
        }
        cumulative += value;
      });
    });

    // Title
    const titleEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    titleEl.setAttribute("x", String(width / 2));
    titleEl.setAttribute("y", "30");
    titleEl.setAttribute("text-anchor", "middle");
    titleEl.setAttribute("font-family", FONT_FAMILY);
    titleEl.setAttribute("font-size", "20");
    titleEl.setAttribute("font-weight", "bold");
    titleEl.textContent = title;
    svg.appendChild(titleEl);

    // X axis label
    const xLabelEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    xLabelEl.setAttribute("x", String(width / 2));
    xLabelEl.setAttribute("y", String(height - 10));
    xLabelEl.setAttribute("text-anchor", "middle");
    xLabelEl.setAttribute("font-family", FONT_FAMILY);
    xLabelEl.setAttribute("font-size", "16");
    xLabelEl.textContent = xLabel;
    svg.appendChild(xLabelEl);

    // Y axis label
    const yLabelEl = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    yLabelEl.setAttribute("transform", "rotate(-90)");
    yLabelEl.setAttribute("x", String(-(height / 2)));
    yLabelEl.setAttribute("y", "20");
    yLabelEl.setAttribute("text-anchor", "middle");
    yLabelEl.setAttribute("font-family", FONT_FAMILY);
    yLabelEl.setAttribute("font-size", "16");
    yLabelEl.textContent = yLabel;
    svg.appendChild(yLabelEl);

    // Legend
    drawLegend({
      rc,
      svg,
      items: seriesNames.map((name, i) => ({
        color: chartColors[i % chartColors.length],
        label: name,
      })),
      x: margin.left + chartWidth - 120,
      y: margin.top + 5,
      fillStyle,
      roughness,
    });
  }, [
    width,
    height,
    rows,
    seriesNames,
    title,
    xLabel,
    yLabel,
    roughness,
    fillStyle,
    onShowTooltip,
    onHideTooltip,
  ]);

  return <svg ref={svgRef} width={width} height={height} />;
}

export default memo(StackedBarChart);
