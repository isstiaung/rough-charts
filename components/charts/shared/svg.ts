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

/**
 * Rendered widths of `texts` in the given font. Needs `parent` to be attached
 * to the document; falls back to an estimate where layout isn't available.
 */
export function measureTextWidths(
  parent: SVGElement,
  texts: string[],
  fontFamily: string,
  fontSize: number
): number[] {
  const probe = svgText(
    { "font-family": fontFamily, "font-size": fontSize, visibility: "hidden" },
    ""
  );
  parent.appendChild(probe);
  const widths = texts.map((text) => {
    probe.textContent = text;
    try {
      const length = probe.getComputedTextLength();
      if (length > 0) return length;
    } catch {
      // not rendered
    }
    return text.length * fontSize * 0.55;
  });
  parent.removeChild(probe);
  return widths;
}
