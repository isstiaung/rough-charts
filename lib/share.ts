import { base64UrlToBytes, bytesToBase64Url } from "./base64";
import { sanitizeSnapshot } from "./snapshot";
import type { ChartSnapshot } from "./types";

/**
 * Share links carry the whole chart, deflated and base64url-encoded, in the
 * URL fragment (#chart=...). Fragments are never sent to the server, so shared
 * data still never leaves the browser except through the link itself.
 */
const HASH_PARAM = "chart";
const FORMAT_VERSION = 1;
/** Guards against decompression bombs in crafted links */
const MAX_DECODED_BYTES = 5 * 1024 * 1024;

async function deflate(bytes: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new CompressionStream("deflate-raw"));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

async function inflate(bytes: Uint8Array): Promise<Uint8Array> {
  const reader = new Blob([bytes as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream("deflate-raw"))
    .getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const { done, value } = await reader.read();
    if (done) break;
    total += value.length;
    if (total > MAX_DECODED_BYTES) {
      await reader.cancel();
      throw new Error("Shared chart is too large");
    }
    chunks.push(value);
  }
  const out = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    out.set(chunk, offset);
    offset += chunk.length;
  }
  return out;
}

export async function encodeChart(snapshot: ChartSnapshot): Promise<string> {
  const json = JSON.stringify({ v: FORMAT_VERSION, ...snapshot });
  return bytesToBase64Url(await deflate(new TextEncoder().encode(json)));
}

/** Returns null for anything that isn't a readable chart. */
export async function decodeChart(
  encoded: string,
  fallback: ChartSnapshot
): Promise<ChartSnapshot | null> {
  try {
    const json = new TextDecoder().decode(
      await inflate(base64UrlToBytes(encoded))
    );
    const parsed: unknown = JSON.parse(json);
    if ((parsed as { v?: unknown })?.v !== FORMAT_VERSION) return null;
    return sanitizeSnapshot(parsed, fallback);
  } catch {
    return null;
  }
}

export async function buildShareUrl(
  snapshot: ChartSnapshot,
  location: Pick<Location, "origin" | "pathname">
): Promise<string> {
  const encoded = await encodeChart(snapshot);
  return `${location.origin}${location.pathname}#${HASH_PARAM}=${encoded}`;
}

/** The encoded chart in a location hash like "#chart=...", if any. */
export function readSharedChartParam(hash: string): string | null {
  return new URLSearchParams(hash.replace(/^#/, "")).get(HASH_PARAM);
}
