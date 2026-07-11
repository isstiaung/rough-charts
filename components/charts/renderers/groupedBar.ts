import { scaleBand, scaleLinear } from "d3-scale";
import { margin } from "../shared/config";
import { seriesColor } from "../shared/colors";
import { drawAxes } from "../shared/drawAxis";
import { paddedDomain } from "../shared/scales";
import { svgNode } from "../shared/svg";
import { addTooltipOverlay, type RenderContext } from "./types";

export function renderGroupedBar(ctx: RenderContext) {
  const { rc, svg, chartWidth, chartHeight, rows, seriesNames } = ctx;

  // Index-based domain so duplicate row labels each get their own band
  const indices = rows.map((_, i) => String(i));
  const xScale = scaleBand().domain(indices).range([0, chartWidth]).padding(0.3);
  const xSub = scaleBand()
    .domain(seriesNames.map((_, i) => String(i)))
    .range([0, xScale.bandwidth()])
    .padding(0.05);

  const domain = paddedDomain(rows.flatMap((r) => r.values));
  const yScale = scaleLinear().domain(domain).range([chartHeight, 0]);
  const y0 = yScale(0);

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
    zeroY: domain[0] < 0 ? margin.top + y0 : undefined,
    rotateLabels: ctx.rotateXLabels,
  });

  rows.forEach((row, rowIdx) => {
    const x0 = xScale(String(rowIdx));
    if (x0 === undefined) return;

    row.values.forEach((value, seriesIdx) => {
      const barX = margin.left + x0 + (xSub(String(seriesIdx)) ?? 0);
      const barY = margin.top + Math.min(yScale(value), y0);
      const barWidth = xSub.bandwidth();
      const barHeight = Math.abs(yScale(value) - y0);

      if (barHeight > 0) {
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
      }
    });
  });
}
