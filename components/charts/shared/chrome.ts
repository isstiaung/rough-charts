import { FONT_FAMILY } from "./config";
import { svgText } from "./svg";

interface ChromeOptions {
  svg: SVGSVGElement;
  width: number;
  height: number;
  title: string;
  xLabel: string;
  yLabel: string;
}

/** Draws the title and axis label text shared by every chart type. */
export function drawChartChrome({
  svg,
  width,
  height,
  title,
  xLabel,
  yLabel,
}: ChromeOptions) {
  svg.appendChild(
    svgText(
      {
        x: width / 2,
        y: 30,
        "text-anchor": "middle",
        "font-family": FONT_FAMILY,
        "font-size": 20,
        "font-weight": "bold",
      },
      title
    )
  );

  svg.appendChild(
    svgText(
      {
        x: width / 2,
        y: height - 10,
        "text-anchor": "middle",
        "font-family": FONT_FAMILY,
        "font-size": 16,
      },
      xLabel
    )
  );

  svg.appendChild(
    svgText(
      {
        transform: "rotate(-90)",
        x: -(height / 2),
        y: 20,
        "text-anchor": "middle",
        "font-family": FONT_FAMILY,
        "font-size": 16,
      },
      yLabel
    )
  );
}
