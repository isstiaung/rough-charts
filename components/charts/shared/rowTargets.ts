import type { DataRow, TooltipData } from "@/lib/types";
import type { Plot } from "../renderers/types";
import { seriesColor } from "./colors";
import { EXPORT_EXCLUDE_ATTR } from "./config";
import { formatValue } from "./format";
import { svgNode } from "./svg";

interface RowTargetOptions {
  svg: SVGSVGElement;
  plot: Plot;
  /** X center of each row, as returned by the renderer */
  xCenters: number[];
  rows: DataRow[];
  seriesNames: string[];
  onShowTooltip: (data: TooltipData) => void;
  onHideTooltip: () => void;
}

/**
 * Adds one invisible, focusable column per row spanning the plot height.
 * Hovering, tapping, or tabbing to it shows the row's tooltip, so even
 * zero-height bars are reachable, and screen readers read the row's values.
 */
export function addRowTargets({
  svg,
  plot,
  xCenters,
  rows,
  seriesNames,
  onShowTooltip,
  onHideTooltip,
}: RowTargetOptions) {
  const layer = svgNode("g", { [EXPORT_EXCLUDE_ATTR]: "" });
  const n = xCenters.length;
  // Rows are evenly spaced in every chart type
  const step = n > 1 ? (xCenters[n - 1] - xCenters[0]) / (n - 1) : plot.width;

  xCenters.forEach((center, i) => {
    const row = rows[i];
    const items = row.values.map((value, s) => ({
      color: seriesColor(s),
      name: seriesNames[s] ?? `Series ${s + 1}`,
      value,
    }));
    const left = Math.max(center - step / 2, plot.left);
    const right = Math.min(center + step / 2, plot.left + plot.width);

    const target = svgNode("rect", {
      x: left,
      y: plot.top,
      width: right - left,
      height: plot.height,
      fill: "transparent",
      class: "row-target",
      tabindex: 0,
      role: "img",
      "aria-label": `${row.label || `Row ${i + 1}`}: ${items
        .map((item) => `${item.name} ${formatValue(item.value)}`)
        .join(", ")}`,
    });

    const show = (x: number, y: number) =>
      onShowTooltip({ x, y, label: row.label, items });
    const showAtPointer = (e: PointerEvent) => {
      const box = svg.getBoundingClientRect();
      show(e.clientX - box.left, e.clientY - box.top);
    };

    target.addEventListener("pointerenter", showAtPointer);
    target.addEventListener("pointermove", showAtPointer);
    // A touch pointer "leaves" as soon as the finger lifts; keep the tooltip
    // up until the next tap elsewhere instead
    target.addEventListener("pointerleave", (e) => {
      if (e.pointerType !== "touch") onHideTooltip();
    });
    target.addEventListener("focus", () => {
      // Clicks focus too; only keyboard focus anchors the tooltip to the row
      if (target.matches(":focus-visible")) {
        show(center, plot.top + plot.height / 3);
      }
    });
    target.addEventListener("blur", onHideTooltip);

    layer.appendChild(target);
  });

  svg.appendChild(layer);
}
