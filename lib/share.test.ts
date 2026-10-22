import { describe, it, expect } from "vitest";
import { bytesToBase64Url } from "./base64";
import {
  buildShareUrl,
  decodeChart,
  encodeChart,
  readSharedChartParam,
} from "./share";
import { defaultSnapshot } from "./store";
import type { ChartSnapshot } from "./types";

const chart: ChartSnapshot = {
  ...defaultSnapshot,
  title: "Q3 — résumé 📈",
  chartType: "line",
  rows: [
    { label: "North", values: [1500000, -3.25] },
    { label: "South", values: [0, 42] },
  ],
};

describe("share links", () => {
  it("round-trips a chart", async () => {
    const encoded = await encodeChart(chart);
    expect(encoded).toMatch(/^[A-Za-z0-9_-]+$/);
    expect(await decodeChart(encoded, defaultSnapshot)).toEqual(chart);
  });

  it("builds a fragment URL that readSharedChartParam reads back", async () => {
    const url = await buildShareUrl(chart, {
      origin: "https://example.com",
      pathname: "/",
    });
    const { hash } = new URL(url);
    expect(url.startsWith("https://example.com/#chart=")).toBe(true);
    const param = readSharedChartParam(hash);
    expect(param).not.toBeNull();
    expect(await decodeChart(param!, defaultSnapshot)).toEqual(chart);
  });

  it("ignores hashes without a chart", () => {
    expect(readSharedChartParam("")).toBeNull();
    expect(readSharedChartParam("#section-2")).toBeNull();
  });

  it("returns null for garbage or truncated links", async () => {
    const encoded = await encodeChart(chart);
    expect(await decodeChart("not-a-chart", defaultSnapshot)).toBeNull();
    expect(
      await decodeChart(encoded.slice(0, encoded.length / 2), defaultSnapshot)
    ).toBeNull();
  });

  it("returns null for an unknown format version", async () => {
    const raw = new TextEncoder().encode(JSON.stringify({ v: 99, ...chart }));
    const stream = new Blob([raw])
      .stream()
      .pipeThrough(new CompressionStream("deflate-raw"));
    const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    expect(
      await decodeChart(bytesToBase64Url(bytes), defaultSnapshot)
    ).toBeNull();
  });

  it("refuses links that inflate past the size cap", async () => {
    const huge = new TextEncoder().encode(
      JSON.stringify({ v: 1, ...chart, title: " ".repeat(6 * 1024 * 1024) })
    );
    const stream = new Blob([huge])
      .stream()
      .pipeThrough(new CompressionStream("deflate-raw"));
    const bytes = new Uint8Array(await new Response(stream).arrayBuffer());
    expect(
      await decodeChart(bytesToBase64Url(bytes), defaultSnapshot)
    ).toBeNull();
  });
});
