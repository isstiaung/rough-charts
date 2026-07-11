import type { RoughSVG } from "roughjs/bin/svg";
import { FONT_FAMILY } from "./config";
import { svgNode, svgText, measureTextWidth } from "./svg";
import type { FillStyle } from "@/lib/types";

interface LegendOptions {
  rc: RoughSVG;
  svg: SVGSVGElement;
  items: { color: string; label: string }[];
  /** Center X position of the legend */
  x: number;
  /** Top Y position of the legend */
  y: number;
  /** Maximum legend width before items wrap to a new row */
  maxWidth: number;
  fillStyle: FillStyle;
  roughness: number;
}

/** Height reserved for a single-row legend below the chart */
export const LEGEND_HEIGHT = 40;

const BOX_SIZE = 12;
const ITEM_GAP = 16;
const ROW_GAP = 10;
const PADDING = 8;
const FONT_SIZE = 13;

/** Draws the legend (wrapping items into rows) and returns its total height. */
export function drawLegend({
  rc,
  svg,
  items,
  x,
  y,
  maxWidth,
  fillStyle,
  roughness,
}: LegendOptions): number {
  if (items.length === 0) return 0;

  const g = svgNode("g");

  // Measure label widths using a temporary rendered text node
  const tempText = svgNode("text", {
    "font-family": FONT_FAMILY,
    "font-size": FONT_SIZE,
  });
  svg.appendChild(tempText);
  const itemWidths = items.map((item) => {
    tempText.textContent = item.label;
    return BOX_SIZE + 6 + measureTextWidth(tempText, FONT_SIZE);
  });
  svg.removeChild(tempText);

  // Greedy wrap into rows
  const maxRowWidth = Math.max(maxWidth - PADDING * 2, BOX_SIZE * 4);
  const rows: number[][] = [[]];
  const rowWidths: number[] = [0];
  itemWidths.forEach((itemWidth, i) => {
    const row = rows.length - 1;
    const widthIfAdded =
      rowWidths[row] + (rows[row].length > 0 ? ITEM_GAP : 0) + itemWidth;
    if (rows[row].length > 0 && widthIfAdded > maxRowWidth) {
      rows.push([i]);
      rowWidths.push(itemWidth);
    } else {
      rows[row].push(i);
      rowWidths[row] = widthIfAdded;
    }
  });

  const bgWidth = Math.max(...rowWidths) + PADDING * 2;
  const bgHeight =
    rows.length * BOX_SIZE + (rows.length - 1) * ROW_GAP + PADDING * 2;

  const left = x - bgWidth / 2;
  g.setAttribute("transform", `translate(${left}, ${y})`);

  const bg = rc.rectangle(0, 0, bgWidth, bgHeight, {
    fill: "white",
    fillStyle: "solid",
    stroke: "black",
    strokeWidth: 1,
    roughness: roughness * 0.5,
    fillWeight: 1,
  });
  g.appendChild(bg);

  rows.forEach((rowItems, rowIdx) => {
    // Center each row within the background
    let currentX = PADDING + (bgWidth - PADDING * 2 - rowWidths[rowIdx]) / 2;
    const rowY = PADDING + rowIdx * (BOX_SIZE + ROW_GAP);

    rowItems.forEach((itemIdx) => {
      const item = items[itemIdx];

      const swatch = rc.rectangle(currentX, rowY, BOX_SIZE, BOX_SIZE, {
        fill: item.color,
        fillStyle,
        stroke: item.color,
        strokeWidth: 1,
        roughness: roughness * 0.5,
      });
      g.appendChild(swatch);

      g.appendChild(
        svgText(
          {
            x: currentX + BOX_SIZE + 6,
            y: rowY + BOX_SIZE - 1,
            "font-family": FONT_FAMILY,
            "font-size": FONT_SIZE,
            fill: "black",
          },
          item.label
        )
      );

      currentX += itemWidths[itemIdx] + ITEM_GAP;
    });
  });

  svg.appendChild(g);
  return bgHeight;
}
