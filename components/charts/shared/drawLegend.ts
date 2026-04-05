import type { RoughSVG } from "roughjs/bin/svg";
import { FONT_FAMILY } from "./config";
import type { FillStyle } from "@/lib/types";

interface LegendOptions {
  rc: RoughSVG;
  svg: SVGSVGElement;
  items: { color: string; label: string }[];
  /** Center X position of the legend */
  x: number;
  /** Top Y position of the legend */
  y: number;
  fillStyle: FillStyle;
  roughness: number;
}

/** Height reserved for the horizontal legend area below the chart */
export const LEGEND_HEIGHT = 40;

export function drawLegend({
  rc,
  svg,
  items,
  x,
  y,
  fillStyle,
  roughness,
}: LegendOptions) {
  const boxSize = 12;
  const itemGap = 16;
  const padding = 8;

  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");

  // Measure text widths
  const tempText = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  tempText.setAttribute("font-family", FONT_FAMILY);
  tempText.setAttribute("font-size", "13");
  svg.appendChild(tempText);

  const textWidths: number[] = [];
  items.forEach((item) => {
    tempText.textContent = item.label;
    textWidths.push(tempText.getComputedTextLength());
  });
  svg.removeChild(tempText);

  // Calculate total width for horizontal layout
  let totalItemsWidth = 0;
  items.forEach((_, i) => {
    totalItemsWidth += boxSize + 6 + textWidths[i];
    if (i < items.length - 1) totalItemsWidth += itemGap;
  });
  const bgWidth = totalItemsWidth + padding * 2;
  const bgHeight = boxSize + padding * 2;

  // x is the center point, calculate left edge
  const left = x - bgWidth / 2;
  g.setAttribute("transform", `translate(${left}, ${y})`);

  // Background rectangle
  const bg = rc.rectangle(0, 0, bgWidth, bgHeight, {
    fill: "white",
    fillStyle: "solid",
    stroke: "black",
    strokeWidth: 1,
    roughness: roughness * 0.5,
    fillWeight: 1,
  });
  g.appendChild(bg);

  let currentX = padding;
  items.forEach((item, i) => {
    // Color swatch
    const swatch = rc.rectangle(currentX, padding, boxSize, boxSize, {
      fill: item.color,
      fillStyle,
      stroke: item.color,
      strokeWidth: 1,
      roughness: roughness * 0.5,
    });
    g.appendChild(swatch);

    // Label text
    const text = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    text.setAttribute("x", String(currentX + boxSize + 6));
    text.setAttribute("y", String(padding + boxSize - 1));
    text.setAttribute("font-family", FONT_FAMILY);
    text.setAttribute("font-size", "13");
    text.setAttribute("fill", "black");
    text.textContent = item.label;
    g.appendChild(text);

    currentX += boxSize + 6 + textWidths[i] + itemGap;
  });

  svg.appendChild(g);
}
