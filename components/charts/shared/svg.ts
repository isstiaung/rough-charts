const SVG_NS = "http://www.w3.org/2000/svg";

export function svgNode<K extends keyof SVGElementTagNameMap>(
  name: K,
  attrs: Record<string, string | number> = {}
): SVGElementTagNameMap[K] {
  const el = document.createElementNS(SVG_NS, name);
  for (const [key, value] of Object.entries(attrs)) {
    el.setAttribute(key, String(value));
  }
  return el;
}

export function svgText(
  attrs: Record<string, string | number>,
  content: string
): SVGTextElement {
  const el = svgNode("text", attrs);
  el.textContent = content;
  return el;
}

/** getComputedTextLength requires a rendered element; fall back to an estimate. */
export function measureTextWidth(el: SVGTextElement, fontSize: number): number {
  try {
    const length = el.getComputedTextLength();
    if (length > 0) return length;
  } catch {
    // not rendered yet
  }
  return (el.textContent?.length ?? 0) * fontSize * 0.55;
}
