import { scaleBand, scaleLinear } from "d3-scale";
import { margin } from "../shared/config";
import { seriesColor } from "../shared/colors";
import { drawAxes } from "../shared/drawAxis";
import { paddedDomain, stackSegments, stackTotals } from "../shared/scales";
import { svgNode } from "../shared/svg";
import { addTooltipOverlay, type RenderContext } from "./types";

export function renderStackedBar(ctx: RenderContext) {
  const { rc, svg, chartWidth, chartHeight, rows } = ctx;

  const indices = rows.map((_, i) => String(i));
  const xScale = scaleBand().domain(indices).range([0, chartWidth]).padding(0.3);

  // Domain spans the stacked extremes (positive and negative totals per row)
  const domain = paddedDomain(rows.flatMap((r) => stackTotals(r.values)));
  const yScale = scaleLinear().domain(domain).range([chartHeight, 0]);

  drawAxes({
    rc,
    svg,
    chartWidth,
    chartHeight,
    xTicks: rows.map((row, i) => ({
      x: margin.left + (xScale(String(i)) ?? 0) + xScale.bandwidth() / 2,
      label: row.label,
    })),
    yScale: (v) => yScale(v),
    yTicks: yScale.ticks(5),
    zeroY: domain[0] < 0 ? margin.top + yScale(0) : undefined,
    rotateLabels: ctx.rotateXLabels,
  });

  rows.forEach((row, rowIdx) => {
    const x0 = xScale(String(rowIdx));
    if (x0 === undefined) return;

    const barX = margin.left + x0;
    const barWidth = xScale.bandwidth();

    stackSegments(row.values).forEach((segment, seriesIdx) => {
      const barY = margin.top + yScale(segment.end);
      const barHeight = Math.abs(yScale(segment.start) - yScale(segment.end));
      if (barHeight <= 0) return;

      svg.appendChild(
        rc.rectangle(barX, barY, barWidth, barHeight, {
          fill: seriesColor(seriesIdx),
          fillStyle: ctx.fillStyle,
          roughness: ctx.roughness,
          stroke: "black",
          strokeWidth: 1.5,
        })
      );

      addTooltipOverlay(
        ctx,
        svgNode("rect", {
          x: barX,
          y: barY,
          width: barWidth,
          height: barHeight,
        }),
        row
      );
    });
  });
}
