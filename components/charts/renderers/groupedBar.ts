import { scaleBand } from "d3-scale";
import { seriesColor } from "../shared/colors";
import { drawAxes } from "../shared/drawAxis";
import type { ChartRenderer } from "./types";

export const groupedBar: ChartRenderer = {
  yValues: (rows) => rows.flatMap((r) => r.values),
  zeroBaseline: true,

  draw(ctx) {
    const { sketch, root, plot, rows, seriesNames, yScale } = ctx;

    // Index-based domain so duplicate row labels each get their own band
    const indices = rows.map((_, i) => String(i));
    const xScale = scaleBand()
      .domain(indices)
      .range([plot.left, plot.left + plot.width])
      .padding(0.3);
    const xSub = scaleBand()
      .domain(seriesNames.map((_, i) => String(i)))
      .range([0, xScale.bandwidth()])
      .padding(0.05);

    const xCenters = indices.map(
      (i) => (xScale(i) ?? 0) + xScale.bandwidth() / 2
    );
    drawAxes(ctx, xCenters);

    const y0 = yScale(0);
    rows.forEach((row, rowIdx) => {
      const x0 = xScale(String(rowIdx));
      if (x0 === undefined) return;

      row.values.forEach((value, seriesIdx) => {
        const barHeight = Math.abs(yScale(value) - y0);
        if (barHeight <= 0) return;

        root.appendChild(
          sketch.rectangle(
            `bar-${rowIdx}-${seriesIdx}`,
            x0 + (xSub(String(seriesIdx)) ?? 0),
            Math.min(yScale(value), y0),
            xSub.bandwidth(),
            barHeight,
            {
              fill: seriesColor(seriesIdx),
              fillStyle: ctx.fillStyle,
              roughness: ctx.roughness,
              stroke: "black",
              strokeWidth: 1.5,
            }
          )
        );
      });
    });

    return xCenters;
  },
};
