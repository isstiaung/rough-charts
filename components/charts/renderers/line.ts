import { scalePoint, scaleLinear } from "d3-scale";
import { margin } from "../shared/config";
import { seriesColor } from "../shared/colors";
import { drawAxes } from "../shared/drawAxis";
import { paddedDomain } from "../shared/scales";
import { svgNode } from "../shared/svg";
import { addTooltipOverlay, type RenderContext } from "./types";

export function renderLine(ctx: RenderContext) {
  const { rc, svg, chartWidth, chartHeight, rows, seriesNames } = ctx;

  const indices = rows.map((_, i) => String(i));
  const xScale = scalePoint().domain(indices).range([0, chartWidth]).padding(0.5);

  const domain = paddedDomain(rows.flatMap((r) => r.values));
  const yScale = scaleLinear().domain(domain).range([chartHeight, 0]);

  drawAxes({
    rc,
    svg,
    chartWidth,
    chartHeight,
    xTicks: rows.map((row, i) => ({
      x: margin.left + (xScale(String(i)) ?? 0),
      label: row.label,
    })),
    yScale: (v) => yScale(v),
    yTicks: yScale.ticks(5),
    zeroY: domain[0] < 0 ? margin.top + yScale(0) : undefined,
    rotateLabels: ctx.rotateXLabels,
  });

  seriesNames.forEach((_, seriesIdx) => {
    const color = seriesColor(seriesIdx);
    const points: [number, number][] = rows.map((row, i) => [
      margin.left + (xScale(String(i)) ?? 0),
      margin.top + yScale(row.values[seriesIdx] ?? 0),
    ]);

    if (points.length > 1) {
      svg.appendChild(
        rc.linearPath(points, {
          stroke: color,
          strokeWidth: 2.5,
          roughness: ctx.roughness * 0.8,
        })
      );
    }

    points.forEach(([x, y], rowIdx) => {
      svg.appendChild(
        rc.circle(x, y, 10, {
          fill: color,
          fillStyle: "solid",
          stroke: color,
          strokeWidth: 1,
          roughness: ctx.roughness * 0.3,
        })
      );

      addTooltipOverlay(
        ctx,
        svgNode("circle", { cx: x, cy: y, r: 12 }),
        rows[rowIdx]
      );
    });
  });
}
