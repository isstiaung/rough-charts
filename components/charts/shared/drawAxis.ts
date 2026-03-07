import type { RoughSVG } from "roughjs/bin/svg";
import { margin, FONT_FAMILY } from "./config";

interface AxisOptions {
  rc: RoughSVG;
  svg: SVGSVGElement;
  width: number;
  height: number;
  xScale: (label: string) => number | undefined;
  yScale: (value: number) => number;
  xLabels: string[];
  yTicks: number[];
  xBandwidth?: number;
}

export function drawAxes({
  rc,
  svg,
  width,
  height,
  xScale,
  yScale,
  xLabels,
  yTicks,
  xBandwidth,
}: AxisOptions) {
  const chartWidth = width - margin.left - margin.right;
  const chartHeight = height - margin.top - margin.bottom;

  // Draw X axis line
  const xAxisLine = rc.line(
    margin.left,
    margin.top + chartHeight,
    margin.left + chartWidth,
    margin.top + chartHeight,
    { roughness: 0.8, stroke: "black", strokeWidth: 1.5 }
  );
  svg.appendChild(xAxisLine);

  // Draw Y axis line
  const yAxisLine = rc.line(
    margin.left,
    margin.top,
    margin.left,
    margin.top + chartHeight,
    { roughness: 0.8, stroke: "black", strokeWidth: 1.5 }
  );
  svg.appendChild(yAxisLine);

  // X axis labels
  xLabels.forEach((label) => {
    const x = xScale(label);
    if (x === undefined) return;
    const centerX = margin.left + x + (xBandwidth ?? 0) / 2;

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", String(centerX));
    text.setAttribute("y", String(margin.top + chartHeight + 25));
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("font-family", FONT_FAMILY);
    text.setAttribute("font-size", "14");
    text.setAttribute("fill", "black");
    text.textContent = label;
    svg.appendChild(text);

    // Small tick
    const tick = rc.line(
      centerX,
      margin.top + chartHeight,
      centerX,
      margin.top + chartHeight + 5,
      { roughness: 0.5, stroke: "black", strokeWidth: 1 }
    );
    svg.appendChild(tick);
  });

  // Y axis ticks and labels
  yTicks.forEach((tickVal) => {
    const y = margin.top + yScale(tickVal);

    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.setAttribute("x", String(margin.left - 10));
    text.setAttribute("y", String(y + 4));
    text.setAttribute("text-anchor", "end");
    text.setAttribute("font-family", FONT_FAMILY);
    text.setAttribute("font-size", "14");
    text.setAttribute("fill", "black");
    text.textContent = String(tickVal);
    svg.appendChild(text);

    // Grid line
    const gridLine = rc.line(
      margin.left,
      y,
      margin.left + chartWidth,
      y,
      { roughness: 0.5, stroke: "#ddd", strokeWidth: 0.5 }
    );
    svg.appendChild(gridLine);
  });
}
