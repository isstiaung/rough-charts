/**
 * Generates all brand assets (logo, favicons, PWA icons, OG image) from the
 * hand-drawn chart mark defined below.
 *
 * Usage: node scripts/generate-icons.mjs
 */
import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";
import sharp from "sharp";

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const pub = path.join(root, "public");
mkdirSync(pub, { recursive: true });

const PAPER = "#fdf8ee";
const INK = "#1f1f1f";
const RED = "#dd4528";
const BLUE = "#28a3dd";
const YELLOW = "#f3db52";
const PINK = "#ed84b5";
const GREEN = "#4ab74e";

/** Hand-wobbled rectangle path. Offsets are fixed per bar so output is stable. */
function wobblyBar(x, width, top, bottom, o, s = 1) {
  const x2 = x + width;
  const w = (i) => o[i % o.length] * s;
  const midY = (t) => top + (bottom - top) * t;
  return [
    `M${x + w(0)} ${top + w(1)}`,
    `C${x + width * 0.3 + w(2)} ${top + w(3)}, ${x + width * 0.7 + w(4)} ${top + w(5)}, ${x2 + w(6)} ${top + w(7)}`,
    `C${x2 + w(8)} ${midY(0.35)}, ${x2 + w(9)} ${midY(0.7)}, ${x2 + w(10)} ${bottom}`,
    `L${x + w(11)} ${bottom + w(0)}`,
    `C${x + w(1)} ${midY(0.65)}, ${x + w(2)} ${midY(0.3)}, ${x + w(0)} ${top + w(1)}`,
    "Z",
  ].join(" ");
}

/** Hand-wobbled line with two gentle bends. */
function wobblyLine(x1, y1, x2, y2, bend) {
  const mx1 = x1 + (x2 - x1) * 0.33;
  const my1 = y1 + (y2 - y1) * 0.33;
  const mx2 = x1 + (x2 - x1) * 0.66;
  const my2 = y1 + (y2 - y1) * 0.66;
  const horizontal = Math.abs(x2 - x1) > Math.abs(y2 - y1);
  const [ox, oy] = horizontal ? [0, bend] : [bend, 0];
  return `M${x1} ${y1} C${mx1 + ox} ${my1 + oy}, ${mx2 - ox} ${my2 - oy}, ${x2} ${y2}`;
}

const O1 = [2, -2, 3, 1, -2, 2, 1, -3, 3, -2, 2, -1];
const O2 = [-2, 2, -1, 3, 2, -2, -3, 1, -2, 3, -1, 2];
const O3 = [1, -3, 2, -1, 3, 1, -2, 2, 1, -3, 2, -2];

/** The mark: three sketchy bars on sketchy axes, in a 512x512 box. */
function mark(scale = 1) {
  const s = scale;
  const bars = [
    { path: wobblyBar(150, 68, 300, 404, O1, s), fill: RED },
    { path: wobblyBar(246, 68, 228, 404, O2, s), fill: BLUE },
    { path: wobblyBar(342, 68, 128, 404, O3, s), fill: YELLOW },
  ];
  const barEls = bars
    .map(
      (b) =>
        `<path d="${b.path}" fill="${b.fill}" stroke="${INK}" stroke-width="11"/>`
    )
    .join("\n    ");
  return `<g fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${barEls}
    <path d="${wobblyLine(112, 92, 112, 408, 5 * s)}" stroke="${INK}" stroke-width="13"/>
    <path d="${wobblyLine(96, 404, 428, 404, 4 * s)}" stroke="${INK}" stroke-width="13"/>
  </g>`;
}

function svgDoc(width, height, body) {
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">\n${body}\n</svg>\n`;
}

// icon.svg — rounded app tile, used as the modern favicon
const iconSvg = svgDoc(
  512,
  512,
  `  <rect width="512" height="512" rx="104" fill="${PAPER}"/>\n  ${mark()}`
);

// logo.svg — transparent mark for in-app use
const logoSvg = svgDoc(512, 512, `  ${mark()}`);

// Square, full-bleed tile (apple touch icon, favicon.ico sources)
const squareSvg = svgDoc(
  512,
  512,
  `  <rect width="512" height="512" fill="${PAPER}"/>\n  ${mark()}`
);

// Maskable: full-bleed background, mark shrunk into the safe zone
const maskableSvg = svgDoc(
  512,
  512,
  `  <rect width="512" height="512" fill="${PAPER}"/>\n  <g transform="translate(43.5 43.5) scale(0.83)">${mark()}</g>`
);

// OG image: a wider hand-drawn chart scene
const ogBars = [
  { x: 240, top: 380, fill: RED, o: O1 },
  { x: 400, top: 300, fill: BLUE, o: O2 },
  { x: 560, top: 210, fill: YELLOW, o: O3 },
  { x: 720, top: 330, fill: PINK, o: O2 },
  { x: 880, top: 140, fill: GREEN, o: O1 },
]
  .map(
    (b) =>
      `<path d="${wobblyBar(b.x, 110, b.top, 536, b.o, 1.6)}" fill="${b.fill}" stroke="${INK}" stroke-width="9"/>`
  )
  .join("\n    ");
const ogSvg = svgDoc(
  1200,
  630,
  `  <rect width="1200" height="630" fill="${PAPER}"/>
  <g fill="none" stroke-linecap="round" stroke-linejoin="round">
    ${ogBars}
    <path d="${wobblyLine(170, 80, 170, 542, 7)}" stroke="${INK}" stroke-width="11"/>
    <path d="${wobblyLine(150, 536, 1060, 536, 6)}" stroke="${INK}" stroke-width="11"/>
  </g>`
);

/** Packs PNG buffers into a .ico file (PNG-compressed entries). */
function buildIco(entries) {
  const header = Buffer.alloc(6);
  header.writeUInt16LE(0, 0); // reserved
  header.writeUInt16LE(1, 2); // type: icon
  header.writeUInt16LE(entries.length, 4);

  const dirSize = 16 * entries.length;
  let offset = 6 + dirSize;
  const dirs = [];
  for (const { size, png } of entries) {
    const dir = Buffer.alloc(16);
    dir.writeUInt8(size >= 256 ? 0 : size, 0); // width
    dir.writeUInt8(size >= 256 ? 0 : size, 1); // height
    dir.writeUInt8(0, 2); // palette
    dir.writeUInt8(0, 3); // reserved
    dir.writeUInt16LE(1, 4); // color planes
    dir.writeUInt16LE(32, 6); // bits per pixel
    dir.writeUInt32LE(png.length, 8);
    dir.writeUInt32LE(offset, 12);
    dirs.push(dir);
    offset += png.length;
  }
  return Buffer.concat([header, ...dirs, ...entries.map((e) => e.png)]);
}

async function renderPng(svg, size) {
  return sharp(Buffer.from(svg)).resize(size, size).png().toBuffer();
}

writeFileSync(path.join(pub, "icon.svg"), iconSvg);
writeFileSync(path.join(pub, "logo.svg"), logoSvg);

const [png192, png512, maskable512, apple180, ico16, ico32, ico48] =
  await Promise.all([
    renderPng(iconSvg, 192),
    renderPng(iconSvg, 512),
    renderPng(maskableSvg, 512),
    renderPng(squareSvg, 180),
    renderPng(squareSvg, 16),
    renderPng(squareSvg, 32),
    renderPng(squareSvg, 48),
  ]);

writeFileSync(path.join(pub, "icon-192.png"), png192);
writeFileSync(path.join(pub, "icon-512.png"), png512);
writeFileSync(path.join(pub, "icon-maskable-512.png"), maskable512);
writeFileSync(path.join(pub, "apple-touch-icon.png"), apple180);
writeFileSync(
  path.join(pub, "favicon.ico"),
  buildIco([
    { size: 16, png: ico16 },
    { size: 32, png: ico32 },
    { size: 48, png: ico48 },
  ])
);

const ogPng = await sharp(Buffer.from(ogSvg)).png().toBuffer();
writeFileSync(path.join(pub, "og.png"), ogPng);

console.log("Generated: icon.svg, logo.svg, icon-192/512, maskable, apple-touch-icon, favicon.ico, og.png");
