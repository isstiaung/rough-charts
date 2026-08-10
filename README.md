# Hand Drawn Charts

Create sketchy, hand-drawn style charts in the browser. Import CSV data, edit live, and export as PNG/SVG/JPEG.

Built with Next.js 15, roughjs, D3, Tailwind 4, and daisyUI 5. Everything runs
client-side — there is no backend, and your data never leaves the browser.

## Features

- **3 chart types**: Grouped Bar, Stacked Bar, Line
- **CSV import**: Drag-and-drop or click to upload
- **Live editing**: Edit data, labels, and titles directly on the page
- **Hand-drawn style**: Configurable roughness, fill styles, and re-rollable stroke randomness (seeded, so charts don't wiggle while you edit)
- **Negative values**: Diverging bars/stacks with a zero line
- **Export**: True vector SVG (font embedded), plus 2x PNG and JPEG, named after the chart title
- **Auto-save**: Data persists in LocalStorage across sessions
- **Responsive**: Works on desktop and mobile; long axis labels rotate, legends wrap

## Getting Started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

- `npm run dev` - Start development server
- `npm run build` - Production build (Next.js + OpenNext worker bundle)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type check
- `npm test` - Run unit tests (Vitest)
- `npm run generate-icons` - Regenerate logo/favicon/OG assets from `scripts/generate-icons.mjs`
- `npm run preview` - Build and preview the Cloudflare Worker locally

## Configuration

Copy `.env.example` to `.env` and adjust as needed. There is one variable:

| Variable | Required | Purpose |
| --- | --- | --- |
| `NEXT_PUBLIC_SITE_URL` | No | Absolute base URL of the deployed site, used to resolve Open Graph / Twitter card image URLs. Defaults to `http://localhost:3000`. |

`NEXT_PUBLIC_*` values are inlined at build time, so this must be set in the
build environment — not as a runtime worker variable.

## Deployment

The app deploys to Cloudflare Workers via
[@opennextjs/cloudflare](https://opennext.js.org/cloudflare). Worker config
lives in `wrangler.jsonc` — change `name` to your own worker name.

```bash
npx wrangler deploy
```

Or connect the repo to Cloudflare Workers Builds and set
`NEXT_PUBLIC_SITE_URL` as a build variable.

It is a standard Next.js app otherwise, so Vercel, Netlify, or a self-hosted
`next start` all work without changes.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Charts**: roughjs + D3 (d3-scale, d3-array)
- **Styling**: Tailwind CSS 4 + daisyUI 5
- **State**: Zustand with LocalStorage persistence
- **CSV**: papaparse
- **Export**: native SVG serialization with embedded font; canvas rasterization for PNG/JPEG
- **Font**: xkcd Script (hand-drawn style)
- **Tests**: Vitest

## Architecture

All three chart types render through a single `RoughChart` component
(`components/charts/RoughChart.tsx`) that owns the SVG lifecycle, title/axis
chrome, and legend. Each chart type contributes only its mark-drawing logic in
`components/charts/renderers/`. Shared pure math (domains, stacking) lives in
`components/charts/shared/scales.ts` and is unit tested.

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
