import { toPng, toSvg, toJpeg } from "html-to-image";

export type ExportFormat = "png" | "svg" | "jpeg";

export async function exportChart(
  format: ExportFormat,
  filename = "chart"
): Promise<void> {
  const el = document.getElementById("chart-container");
  if (!el) throw new Error("Chart container not found");

  const options = {
    backgroundColor: "white",
    style: {
      fontFamily: "xkcd, cursive",
    },
  };

  let dataUrl: string;

  switch (format) {
    case "png":
      dataUrl = await toPng(el, options);
      break;
    case "svg":
      dataUrl = await toSvg(el, options);
      break;
    case "jpeg":
      dataUrl = await toJpeg(el, { ...options, quality: 0.95 });
      break;
  }

  const link = document.createElement("a");
  link.download = `${filename}.${format}`;
  link.href = dataUrl;
  link.click();
}
