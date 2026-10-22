import { scaleBand } from "d3-scale";
import { seriesColor } from "../shared/colors";
import { drawAxes } from "../shared/drawAxis";
import { stackSegments, stackTotals } from "../shared/scales";
import type { ChartRenderer } from "./types";

export const stackedBar: ChartRenderer = {
  // The axis spans the stacked extremes (positive and negative totals per row)
  yValues: (rows) => rows.flatMap((r) => stackTotals(r.values)),
  zeroBaseline: true,

  draw(ctx) {
    const { sketch, root, plot, rows, yScale } = ctx;

    const indices = rows.map((_, i) => String(i));
    const xScale = scaleBand()
      .domain(indices)
      .range([plot.left, plot.left + plot.width])
      .padding(0.3);

    const xCenters = indices.map(
      (i) => (xScale(i) ?? 0) + xScale.bandwidth() / 2
    );
    drawAxes(ctx, xCenters);

    rows.forEach((row, rowIdx) => {
      const barX = xScale(String(rowIdx));
      if (barX === undefined) return;

      stackSegments(row.values).forEach((segment, seriesIdx) => {
        const barHeight = Math.abs(yScale(segment.start) - yScale(segment.end));
        if (barHeight <= 0) return;

        root.appendChild(
          sketch.rectangle(
            `segment-${rowIdx}-${seriesIdx}`,
            barX,
            yScale(segment.end),
            xScale.bandwidth(),
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
