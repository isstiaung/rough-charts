import type { RoughSVG } from "roughjs/bin/svg";
import { FONT_FAMILY } from "./config";
import type { FillStyle } from "@/lib/types";

interface LegendOptions {
  rc: RoughSVG;
  svg: SVGSVGElement;
  items: { color: string; label: string }[];
  x: number;
  y: number;
  fillStyle: FillStyle;
  roughness: number;
}

export function drawLegend({
  rc,
  svg,
  items,
  x,
  y,
  fillStyle,
  roughness,
}: LegendOptions) {
  const itemHeight = 22;
  const boxSize = 12;
  const padding = 10;

  // Create a group for the legend
  const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
  g.setAttribute("transform", `translate(${x}, ${y})`);

  // Measure text widths to determine background width
  let maxTextWidth = 0;
  const tempText = document.createElementNS(
    "http://www.w3.org/2000/svg",
    "text"
  );
  tempText.setAttribute("font-family", FONT_FAMILY);
  tempText.setAttribute("font-size", "13");
  svg.appendChild(tempText);

  items.forEach((item) => {
    tempText.textContent = item.label;
    const w = tempText.getComputedTextLength();
    if (w > maxTextWidth) maxTextWidth = w;
  });
  svg.removeChild(tempText);

  const bgWidth = maxTextWidth + boxSize + padding * 3;
  const bgHeight = items.length * itemHeight + padding * 2;

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

  items.forEach((item, i) => {
    const itemY = padding + i * itemHeight;

    // Color swatch
    const swatch = rc.rectangle(
      padding,
      itemY + 2,
      boxSize,
      boxSize,
      {
        fill: item.color,
        fillStyle,
        stroke: item.color,
        strokeWidth: 1,
        roughness: roughness * 0.5,
      }
    );
    g.appendChild(swatch);

    // Label text
    const text = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "text"
    );
    text.setAttribute("x", String(padding + boxSize + 8));
    text.setAttribute("y", String(itemY + boxSize));
    text.setAttribute("font-family", FONT_FAMILY);
    text.setAttribute("font-size", "13");
    text.setAttribute("fill", "black");
    text.textContent = item.label;
    g.appendChild(text);
  });

  svg.appendChild(g);
}
