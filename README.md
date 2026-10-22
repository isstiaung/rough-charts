# Hand Drawn Charts

Create sketchy, hand-drawn style charts in the browser. Import CSV data, edit live, and export as PNG/SVG/JPEG.

Built with Next.js 15, roughjs, D3, Tailwind 4, and daisyUI 5. Everything runs
client-side — there is no backend, and your data never leaves the browser.

## Features

- **3 chart types**: Grouped Bar, Stacked Bar, Line (line charts fit the y axis to the data instead of starting at zero)
- **Import**: Drag-and-drop or upload a CSV/TSV, or paste cells straight from Excel or Google Sheets (anywhere on the page). Thousands separators, currency symbols, and accounting negatives like `(1,200)` are understood
- **Live editing**: Edit data, labels, and titles directly on the page
- **Undo/redo**: Buttons or Cmd/Ctrl+Z and Shift+Cmd/Ctrl+Z; typing in one field counts as one step
- **Share links**: Copy a link that carries the whole chart in the URL fragment, so the data never touches a server
- **Hand-drawn style**: Configurable roughness, fill styles, and re-rollable stroke randomness (seeded per shape, so charts don't wiggle while you edit)
- **Negative values**: Diverging bars/stacks with a zero line
- **Readable axes**: Large values abbreviate (`1.5M`) and the margin grows to fit tick labels
- **Export**: True vector SVG (font embedded), plus 2x PNG and JPEG, named after the chart title
- **Auto-save**: Data persists in LocalStorage across sessions (versioned and validated on load)
- **Accessible**: Every row of the chart is keyboard-focusable with its values as a label; tooltips work with mouse, touch, and keyboard (Esc closes)
- **Responsive**: Works on desktop and mobile; long axis labels rotate, legends wrap

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build: a fully static site in `out/`
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type check
- `npm test` - Run unit tests (Vitest)
- `npm run generate-icons` - Regenerate logo/favicon/OG assets from `scripts/generate-icons.mjs`
- `npm run preview` - Build and serve `out/` locally through Wrangler, as Cloudflare would

## Configuration

Copy `.env.example` to `.env` and adjust as needed. There is one variable:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Absolute base URL of the deployed site, used to resolve Open Graph / Twitter card image URLs. Defaults to `http://localhost:3000`. |

`NEXT_PUBLIC_*` values are inlined at build time, so this must be set in the
build environment — not as a runtime worker variable.

## Deployment

`npm run build` produces a plain static site in `out/` (Next.js
`output: "export"`); there is no server code. It deploys to Cloudflare Workers
as static assets — config lives in `wrangler.jsonc`, change `name` to your own
worker name.

```bash
npm run build
npx wrangler deploy
```

Or connect the repo to Cloudflare Workers Builds with build command
`npm run build` and deploy command `npx wrangler deploy`, and set
`NEXT_PUBLIC_SITE_URL` as a build variable.

Any static host works too: upload `out/` to Netlify, GitHub Pages, S3, etc.

## Tech Stack

- **Framework**: Next.js 15 (App Router, static export)
- **Charts**: roughjs + D3 (d3-scale, d3-array)
- **Styling**: Tailwind CSS 4 + daisyUI 5
- **State**: Zustand with LocalStorage persistence and zundo undo/redo
- **CSV**: papaparse
- **Export**: native SVG serialization with embedded font; canvas rasterization for PNG/JPEG
- **Font**: xkcd Script (hand-drawn style)
- **Tests**: Vitest

## Architecture

All three chart types render through a single `RoughChart` component
(`components/charts/RoughChart.tsx`) that owns the SVG lifecycle, y scale and
layout, title/axis chrome, legend, and the focusable per-row hover targets.
Each chart type contributes only its y extent and mark-drawing logic in
`components/charts/renderers/`. Shapes are drawn through `Sketch`
(`components/charts/shared/sketch.ts`), which gives every shape its own stable
roughjs seed. Shared pure math (domains, stacking, tick formatting) lives in
`components/charts/shared/` and is unit tested.

State lives in a Zustand store (`lib/store.ts`) with LocalStorage persistence
and zundo undo history. Anything loaded from outside — saved sessions and share
links — passes through `sanitizeSnapshot` (`lib/snapshot.ts`) first.

## License

The source code is MIT licensed — see [LICENSE](LICENSE).

**The bundled font is not.** `public/fonts/xkcd-script.woff2` is
["xkcd Script"](https://github.com/ipython/xkcd-font), licensed
[CC BY-NC 3.0](https://creativecommons.org/licenses/by-nc/3.0/) and based on the
handwriting of [Randall Munroe](https://xkcd.com). It may be used
non-commercially, with attribution. Chart exports embed the font, so exported
files carry those terms too.

If you want to use this project commercially, swap the font for a permissively
licensed hand-drawn typeface — Comic Neue, Patrick Hand, and Shantell Sans are
all under the SIL Open Font License. See [NOTICE](NOTICE) for details.
