import type { RoughSVG } from "roughjs/bin/svg";
import { margin, FONT_FAMILY } from "./config";
import { svgText } from "./svg";

export interface XTick {
  /** Absolute x position (margin included) of the tick center */
  x: number;
  label: string;
}

interface AxisOptions {
  rc: RoughSVG;
  svg: SVGSVGElement;
  chartWidth: number;
  chartHeight: number;
  xTicks: XTick[];
  /** Chart-relative y position for a data value */
  yScale: (value: number) => number;
  yTicks: number[];
  /** Absolute y of the zero line; drawn when the domain crosses zero */
  zeroY?: number;
  /** Slant the x labels (decided up front so the chart can reserve space) */
  rotateLabels: boolean;
}

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

export function drawAxes({
  rc,
  svg,
  chartWidth,
  chartHeight,
  xTicks,
  yScale,
  yTicks,
  zeroY,
  rotateLabels,
}: AxisOptions) {
  const bottom = margin.top + chartHeight;

  // X axis line
  svg.appendChild(
    rc.line(margin.left, bottom, margin.left + chartWidth, bottom, {
      roughness: 0.8,
      stroke: "black",
      strokeWidth: 1.5,
    })
  );

  // Y axis line
  svg.appendChild(
    rc.line(margin.left, margin.top, margin.left, bottom, {
      roughness: 0.8,
      stroke: "black",
      strokeWidth: 1.5,
    })
  );

  // Zero line when the data dips below zero
  if (zeroY !== undefined && Math.abs(zeroY - bottom) > 1) {
    svg.appendChild(
      rc.line(margin.left, zeroY, margin.left + chartWidth, zeroY, {
        roughness: 0.8,
        stroke: "#555",
        strokeWidth: 1,
      })
    );
  }

  // X axis ticks and labels
  xTicks.forEach(({ x, label }) => {
    const display =
      label.length > MAX_LABEL_CHARS
        ? `${label.slice(0, MAX_LABEL_CHARS - 1)}…`
        : label;

    const labelY = bottom + (rotateLabels ? 20 : 25);
    const text = svgText(
      {
        x,
        y: labelY,
        "text-anchor": rotateLabels ? "end" : "middle",
        "font-family": FONT_FAMILY,
        "font-size": 14,
        fill: "black",
        ...(rotateLabels
          ? { transform: `rotate(-30 ${x} ${labelY})` }
          : {}),
      },
      display
    );
    svg.appendChild(text);

    svg.appendChild(
      rc.line(x, bottom, x, bottom + 5, {
        roughness: 0.5,
        stroke: "black",
        strokeWidth: 1,
      })
    );
  });

  // Y axis ticks, labels, and grid lines
  yTicks.forEach((tickVal) => {
    const y = margin.top + yScale(tickVal);

    svg.appendChild(
      svgText(
        {
          x: margin.left - 10,
          y: y + 4,
          "text-anchor": "end",
          "font-family": FONT_FAMILY,
          "font-size": 14,
          fill: "black",
        },
        String(tickVal)
      )
    );

    svg.appendChild(
      rc.line(margin.left, y, margin.left + chartWidth, y, {
        roughness: 0.5,
        stroke: "#ddd",
        strokeWidth: 0.5,
      })
    );
  });
}
