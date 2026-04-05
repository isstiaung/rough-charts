"use client";

import { useEffect, useRef, memo } from "react";
import rough from "roughjs";
import { scalePoint, scaleLinear } from "d3-scale";
import { max } from "d3-array";
import { margin, FONT_FAMILY } from "./shared/config";
import { chartColors } from "./shared/colors";
import { drawAxes } from "./shared/drawAxis";
import { drawLegend, LEGEND_HEIGHT } from "./shared/drawLegend";
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

function LineChart({
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
    const allValues = rows.flatMap((r) => r.values);
    const maxVal = max(allValues) ?? 0;

    const xScale = scalePoint()
      .domain(labels)
      .range([0, chartWidth])
      .padding(0.5);
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
    });

    // Draw lines for each series
    seriesNames.forEach((_, seriesIdx) => {
      const color = chartColors[seriesIdx % chartColors.length];
      const points: [number, number][] = rows.map((row) => {
        const x = xScale(row.label) ?? 0;
        return [
          margin.left + x,
          margin.top + yScale(row.values[seriesIdx] ?? 0),
        ];
      });

      // Draw line using roughjs linearPath
      if (points.length > 1) {
        const line = rc.linearPath(points, {
          stroke: color,
          strokeWidth: 2.5,
          roughness: roughness * 0.8,
        });
        svg.appendChild(line);
      }

      // Draw points with hover areas
      points.forEach(([x, y], rowIdx) => {
        const circle = rc.circle(x, y, 10, {
          fill: color,
          fillStyle: "solid",
          stroke: color,
          strokeWidth: 1,
          roughness: roughness * 0.3,
        });
        svg.appendChild(circle);

        // Larger invisible hover area
        const hitArea = document.createElementNS(
          "http://www.w3.org/2000/svg",
          "circle"
        );
        hitArea.setAttribute("cx", String(x));
        hitArea.setAttribute("cy", String(y));
        hitArea.setAttribute("r", "12");
        hitArea.setAttribute("fill", "transparent");
        hitArea.setAttribute("cursor", "pointer");
        hitArea.addEventListener("mouseenter", (e) => {
          const row = rows[rowIdx];
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
        hitArea.addEventListener("mouseleave", onHideTooltip);
        svg.appendChild(hitArea);
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
      x: width / 2,
      y: height + 5,
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

  return <svg ref={svgRef} width={width} height={height + LEGEND_HEIGHT} />;
}

export default memo(LineChart);
