import type { RoughSVG } from "roughjs/bin/svg";
import type { DataRow, FillStyle, TooltipData } from "@/lib/types";
import { seriesColor } from "../shared/colors";

export interface RenderContext {
  rc: RoughSVG;
  svg: SVGSVGElement;
  chartWidth: number;
  chartHeight: number;
  rows: DataRow[];
  seriesNames: string[];
  roughness: number;
  fillStyle: FillStyle;
  /** Precomputed by the chart so the plot area reserves space for it */
  rotateXLabels: boolean;
  onShowTooltip: (data: TooltipData) => void;
  onHideTooltip: () => void;
}

export type ChartRenderer = (ctx: RenderContext) => void;

/**
 * Turns an invisible shape into a hover target that shows the tooltip
 * for the given row, and appends it to the svg.
 */
export function addTooltipOverlay(
  ctx: RenderContext,
  shape: SVGGraphicsElement,
  row: DataRow
) {
  shape.setAttribute("fill", "transparent");
  shape.setAttribute("cursor", "pointer");
  shape.addEventListener("mouseenter", (e) => {
    ctx.onShowTooltip({
      x: e.offsetX,
      y: e.offsetY,
      label: row.label,
      items: row.values.map((value, si) => ({
        color: seriesColor(si),
        name: ctx.seriesNames[si] ?? `Series ${si + 1}`,
        value,
      })),
    });
  });
  shape.addEventListener("mouseleave", ctx.onHideTooltip);
  ctx.svg.appendChild(shape);
}
