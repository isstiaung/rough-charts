export type ExportFormat = "png" | "svg" | "jpeg";

const SVG_NS = "http://www.w3.org/2000/svg";
const RASTER_SCALE = 2;

let fontDataUrlPromise: Promise<string> | null = null;

/** The xkcd font as a data URI so exported files render correctly anywhere. */
async function getFontDataUrl(): Promise<string> {
  fontDataUrlPromise ??= (async () => {
    const res = await fetch("/fonts/xkcd-script.woff2");
    if (!res.ok) throw new Error("Failed to load chart font");
    const bytes = new Uint8Array(await res.arrayBuffer());
    let binary = "";
    const chunkSize = 8192;
    for (let i = 0; i < bytes.length; i += chunkSize) {
      binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize));
    }
    return `data:font/woff2;base64,${btoa(binary)}`;
  })();

  try {
    return await fontDataUrlPromise;
  } catch (err) {
    fontDataUrlPromise = null;
    throw err;
  }
}

interface SvgMarkup {
  markup: string;
  width: number;
  height: number;
}

/**
 * Serializes the live chart svg into a self-contained SVG document:
 * white background, embedded font, explicit dimensions.
 */
async function buildSvgMarkup(): Promise<SvgMarkup> {
  const source = document.querySelector<SVGSVGElement>("#chart-container svg");
  if (!source) throw new Error("Chart not found");

  const width = source.width.baseVal.value;
  const height = source.height.baseVal.value;

  const clone = source.cloneNode(true) as SVGSVGElement;
  clone.setAttribute("xmlns", SVG_NS);
  clone.setAttribute("width", String(width));
  clone.setAttribute("height", String(height));
  clone.setAttribute("viewBox", `0 0 ${width} ${height}`);
  clone.removeAttribute("role");
  clone.removeAttribute("aria-label");

  const background = document.createElementNS(SVG_NS, "rect");
  background.setAttribute("width", String(width));
  background.setAttribute("height", String(height));
  background.setAttribute("fill", "white");
  clone.insertBefore(background, clone.firstChild);

  const style = document.createElementNS(SVG_NS, "style");
  const fontUrl = await getFontDataUrl();
  style.textContent = `@font-face{font-family:"xkcd";src:url("${fontUrl}") format("woff2");}text{font-family:"xkcd","Comic Sans MS",cursive;}`;
  clone.insertBefore(style, clone.firstChild);

  return { markup: new XMLSerializer().serializeToString(clone), width, height };
}

function downloadFile(href: string, filename: string) {
  const link = document.createElement("a");
  link.download = filename;
  link.href = href;
  link.click();
}

function slugify(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

async function rasterize(
  { markup, width, height }: SvgMarkup,
  mimeType: string,
  quality?: number
): Promise<string> {
  const svgUrl = URL.createObjectURL(
    new Blob([markup], { type: "image/svg+xml;charset=utf-8" })
  );
  try {
    const img = new Image();
    await new Promise<void>((resolve, reject) => {
      img.onload = () => resolve();
      img.onerror = () => reject(new Error("Failed to render chart image"));
      img.src = svgUrl;
    });
    // Ensure the embedded font is decoded before drawing (Safari)
    try {
      await img.decode();
    } catch {
      // decode can reject even when the image is usable; drawImage below will tell
    }

    const canvas = document.createElement("canvas");
    canvas.width = Math.round(width * RASTER_SCALE);
    canvas.height = Math.round(height * RASTER_SCALE);
    const context = canvas.getContext("2d");
    if (!context) throw new Error("Canvas not supported");

    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, canvas.width, canvas.height);
    context.drawImage(img, 0, 0, canvas.width, canvas.height);
    return canvas.toDataURL(mimeType, quality);
  } finally {
    URL.revokeObjectURL(svgUrl);
  }
}

export async function exportChart(
  format: ExportFormat,
  title = ""
): Promise<void> {
  const filename = slugify(title) || "chart";
  const svg = await buildSvgMarkup();

  if (format === "svg") {
    const url = URL.createObjectURL(
      new Blob([svg.markup], { type: "image/svg+xml;charset=utf-8" })
    );
    downloadFile(url, `${filename}.svg`);
    setTimeout(() => URL.revokeObjectURL(url), 10_000);
    return;
  }

  const dataUrl =
    format === "png"
      ? await rasterize(svg, "image/png")
      : await rasterize(svg, "image/jpeg", 0.95);
  downloadFile(dataUrl, `${filename}.${format}`);
}
