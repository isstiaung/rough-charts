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
}

function GroupedBarChart({
  width,
  height,
  rows,
  seriesNames,
  title,
  xLabel,
  yLabel,
  roughness,
  fillStyle,
}: Props) {
  const svgRef = useRef<SVGSVGElement>(null);

  useEffect(() => {
    const svg = svgRef.current;
    if (!svg || rows.length === 0 || seriesNames.length === 0) return;

    // Clear previous content
    while (svg.firstChild) svg.removeChild(svg.firstChild);

    const rc = rough.svg(svg);
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const labels = rows.map((r) => r.label);
    const allValues = rows.flatMap((r) => r.values);
    const maxVal = max(allValues) ?? 0;

    const xScale = scaleBand().domain(labels).range([0, chartWidth]).padding(0.3);
    const xSub = scaleBand()
      .domain(seriesNames.map((_, i) => String(i)))
      .range([0, xScale.bandwidth()])
      .padding(0.05);
    const yScale = scaleLinear()
      .domain([0, maxVal * 1.1])
      .range([chartHeight, 0]);

    // Generate y-axis ticks
    const yTicks = yScale.ticks(5);

    // Draw axes
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

    // Draw bars
    rows.forEach((row) => {
      const x0 = xScale(row.label);
      if (x0 === undefined) return;

      row.values.forEach((value, seriesIdx) => {
        const barX =
          margin.left + x0 + (xSub(String(seriesIdx)) ?? 0);
        const barY = margin.top + yScale(value);
        const barWidth = xSub.bandwidth();
        const barHeight = chartHeight - yScale(value);

        if (barHeight > 0) {
          const rect = rc.rectangle(barX, barY, barWidth, barHeight, {
            fill: chartColors[seriesIdx % chartColors.length],
            fillStyle,
            roughness,
            stroke: "black",
            strokeWidth: 1.5,
          });
          svg.appendChild(rect);
        }
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
    yLabelEl.setAttribute("transform", `rotate(-90)`);
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
  }, [width, height, rows, seriesNames, title, xLabel, yLabel, roughness, fillStyle]);

  return <svg ref={svgRef} width={width} height={height} />;
}

export default memo(GroupedBarChart);
