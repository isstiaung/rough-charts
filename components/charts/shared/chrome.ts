import { FONT_FAMILY } from "./config";
import { svgText } from "./svg";

interface ChromeOptions {
  root: SVGElement;
  width: number;
  height: number;
  title: string;
  xLabel: string;
  yLabel: string;
}

/** Draws the title and axis label text shared by every chart type. */
export function drawChartChrome({
  root,
  width,
  height,
  title,
  xLabel,
  yLabel,
}: ChromeOptions) {
  root.appendChild(
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

  root.appendChild(
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

  root.appendChild(
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
