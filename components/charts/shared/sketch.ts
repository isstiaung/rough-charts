import type { RoughSVG } from "roughjs/bin/svg";
import type { Options } from "roughjs/bin/core";
import type { Point } from "roughjs/bin/geometry";

/** Mixes the chart seed with a shape's key into a positive 31-bit seed. */
export function shapeSeed(base: number, key: string): number {
  let h = base | 0;
  for (let i = 0; i < key.length; i++) {
    h = Math.imul(h ^ key.charCodeAt(i), 0x9e3779b1);
    h ^= h >>> 15;
  }
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35);
  h ^= h >>> 16;
  return h >>> 1 || 1;
}

/** mulberry32 */
function seededRandom(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (state + 0x6d2b79f5) | 0;
    let t = Math.imul(state ^ (state >>> 15), 1 | state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * roughjs's "dots" fill calls Math.random directly, ignoring the seed, so a
 * seeded generator stands in for the duration of a (synchronous) draw.
 */
export function withSeededRandom<T>(seed: number, draw: () => T): T {
  const random = Math.random;
  Math.random = seededRandom(seed);
  try {
    return draw();
  } finally {
    Math.random = random;
  }
}

/**
 * roughjs drawing where every shape gets its own stable seed, derived from the
 * chart seed and a key naming the shape. Distinct seeds make each bar wobble
 * differently; keying by identity rather than draw order keeps a shape's
 * strokes unchanged when other shapes appear or disappear.
 */
export class Sketch {
  constructor(
    private readonly rc: RoughSVG,
    private readonly seed: number
  ) {}

  private draw(
    key: string,
    options: Options,
    render: (options: Options) => SVGGElement
  ): SVGGElement {
    const seed = shapeSeed(this.seed, key);
    return withSeededRandom(seed, () => render({ ...options, seed }));
  }

  line(
    key: string,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    options: Options
  ) {
    return this.draw(key, options, (o) => this.rc.line(x1, y1, x2, y2, o));
  }

  rectangle(
    key: string,
    x: number,
    y: number,
    width: number,
    height: number,
    options: Options
  ) {
    return this.draw(key, options, (o) =>
      this.rc.rectangle(x, y, width, height, o)
    );
  }

  circle(
    key: string,
    x: number,
    y: number,
    diameter: number,
    options: Options
  ) {
    return this.draw(key, options, (o) => this.rc.circle(x, y, diameter, o));
  }

  linearPath(key: string, points: Point[], options: Options) {
    return this.draw(key, options, (o) => this.rc.linearPath(points, o));
  }
}
