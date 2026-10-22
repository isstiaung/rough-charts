import { FONT_FAMILY, TICK_FONT_SIZE, Y_TICK_GAP } from "./config";
import { svgText } from "./svg";
import type { RenderContext } from "../renderers/types";

const MAX_LABEL_CHARS = 16;
const AVG_CHAR_WIDTH = 7.7; // rough estimate for the 14px xkcd font

export interface XLabelLayout {
  rotate: boolean;
  /** Extra bottom space rotated labels need so they clear the axis title */
  extraHeight: number;
}

/**
 * Decides whether x labels must rotate to avoid overlapping, and how much
 * extra vertical space the rotated labels will occupy. Shared by the chart
 * (to shrink the plot area) and drawAxes (to actually rotate).
 */
export function xLabelLayout(
  labels: string[],
  chartWidth: number
): XLabelLayout {
  const maxChars = Math.min(
    labels.reduce((longest, l) => Math.max(longest, l.length), 0),
    MAX_LABEL_CHARS
  );
  const estWidth = maxChars * AVG_CHAR_WIDTH;
  const slotWidth = chartWidth / Math.max(labels.length, 1);
  const rotate = estWidth > slotWidth - 8;
  // Labels rotate -30deg, so they drop below the anchor by ~sin(30) * width
  return { rotate, extraHeight: rotate ? Math.round(estWidth * 0.5) + 12 : 0 };
}

/** Draws both axes, tick labels, grid lines, and the zero line if needed. */
export function drawAxes(ctx: RenderContext, xCenters: number[]) {
  const { sketch, root, plot, rows, yScale, yTicks, formatTick } = ctx;
  const right = plot.left + plot.width;
  const bottom = plot.top + plot.height;

  // X axis line
  root.appendChild(
    sketch.line("x-axis", plot.left, bottom, right, bottom, {
      roughness: 0.8,
      stroke: "black",
      strokeWidth: 1.5,
    })
  );

  // Y axis line
  root.appendChild(
    sketch.line("y-axis", plot.left, plot.top, plot.left, bottom, {
      roughness: 0.8,
      stroke: "black",
      strokeWidth: 1.5,
    })
  );

  // Zero line when the data dips below zero
  const [lo, hi] = yScale.domain();
  const zeroY = yScale(0);
  if (lo < 0 && hi >= 0 && Math.abs(zeroY - bottom) > 1) {
    root.appendChild(
      sketch.line("zero-line", plot.left, zeroY, right, zeroY, {
        roughness: 0.8,
        stroke: "#555",
        strokeWidth: 1,
      })
    );
  }

  // X axis ticks and labels
  xCenters.forEach((x, i) => {
    const label = rows[i].label;
    const display =
      label.length > MAX_LABEL_CHARS
        ? `${label.slice(0, MAX_LABEL_CHARS - 1)}…`
        : label;

    const labelY = bottom + (ctx.rotateXLabels ? 20 : 25);
    root.appendChild(
      svgText(
        {
          x,
          y: labelY,
          "text-anchor": ctx.rotateXLabels ? "end" : "middle",
          "font-family": FONT_FAMILY,
          "font-size": TICK_FONT_SIZE,
          fill: "black",
          ...(ctx.rotateXLabels
            ? { transform: `rotate(-30 ${x} ${labelY})` }
            : {}),
        },
        display
      )
    );

    root.appendChild(
      sketch.line(`x-tick-${i}`, x, bottom, x, bottom + 5, {
        roughness: 0.5,
        stroke: "black",
        strokeWidth: 1,
      })
    );
  });

  // Y axis ticks, labels, and grid lines
  yTicks.forEach((tickVal) => {
    const y = yScale(tickVal);

    root.appendChild(
      svgText(
        {
          x: plot.left - Y_TICK_GAP,
          y: y + 4,
          "text-anchor": "end",
          "font-family": FONT_FAMILY,
          "font-size": TICK_FONT_SIZE,
          fill: "black",
        },
        formatTick(tickVal)
      )
    );

    root.appendChild(
      sketch.line(`grid-${tickVal}`, plot.left, y, right, y, {
        roughness: 0.5,
        stroke: "#ddd",
        strokeWidth: 0.5,
      })
    );
  });
}
