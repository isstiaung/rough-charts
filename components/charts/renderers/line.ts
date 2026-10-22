import { scalePoint } from "d3-scale";
import { seriesColor } from "../shared/colors";
import { drawAxes } from "../shared/drawAxis";
import type { ChartRenderer } from "./types";

export const line: ChartRenderer = {
  yValues: (rows) => rows.flatMap((r) => r.values),
  zeroBaseline: false,

  draw(ctx) {
    const { sketch, root, plot, rows, seriesNames, yScale } = ctx;

    const indices = rows.map((_, i) => String(i));
    const xScale = scalePoint()
      .domain(indices)
      .range([plot.left, plot.left + plot.width])
      .padding(0.5);

    const xCenters = indices.map((i) => xScale(i) ?? 0);
    drawAxes(ctx, xCenters);

    seriesNames.forEach((_, seriesIdx) => {
      const color = seriesColor(seriesIdx);
      const points: [number, number][] = rows.map((row, i) => [
        xCenters[i],
        yScale(row.values[seriesIdx] ?? 0),
      ]);

      if (points.length > 1) {
        root.appendChild(
          sketch.linearPath(`line-${seriesIdx}`, points, {
            stroke: color,
            strokeWidth: 2.5,
            roughness: ctx.roughness * 0.8,
          })
        );
      }

      points.forEach(([x, y], rowIdx) => {
        root.appendChild(
          sketch.circle(`point-${seriesIdx}-${rowIdx}`, x, y, 10, {
            fill: color,
            fillStyle: "solid",
            stroke: color,
            strokeWidth: 1,
            roughness: ctx.roughness * 0.3,
          })
        );
      });
    });

    return xCenters;
  },
};
