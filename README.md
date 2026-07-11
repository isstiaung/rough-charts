# Hand Drawn Charts

Create sketchy, hand-drawn style charts in the browser. Import CSV data, edit live, and export as PNG/SVG/JPEG.

Live at [example.com](https://example.com).

Built with Next.js 15, roughjs, D3, Tailwind 4, and daisyUI 5.

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
- `npm run build` - Production build
- `npm run start` - Start production server
- `npm run lint` - Run ESLint
- `npm run typecheck` - TypeScript type check
- `npm test` - Run unit tests (Vitest)
- `npm run generate-icons` - Regenerate logo/favicon/OG assets from `scripts/generate-icons.mjs`
- `npm run preview` - Build and preview the Cloudflare Worker locally

## Deployment

Deployed to Cloudflare Workers (worker: `rough-charts`) via
[@opennextjs/cloudflare](https://opennext.js.org/cloudflare) and Workers Builds
(git integration), served at [example.com](https://example.com).
Pushing to the `deploy-worker` branch triggers a production build and deploy;
`main` is for development. Worker config lives in `wrangler.jsonc`.

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Charts**: roughjs + D3 (d3-scale, d3-array)
- **Styling**: Tailwind CSS 4 + daisyUI 5
- **State**: Zustand with LocalStorage persistence
- **CSV**: papaparse
- **Export**: native SVG serialization with embedded font; canvas rasterization for PNG/JPEG
- **Font**: XKCD Script (hand-drawn style)
- **Tests**: Vitest

## Architecture

All three chart types render through a single `RoughChart` component
(`components/charts/RoughChart.tsx`) that owns the SVG lifecycle, title/axis
chrome, and legend. Each chart type contributes only its mark-drawing logic in
`components/charts/renderers/`. Shared pure math (domains, stacking) lives in
`components/charts/shared/scales.ts` and is unit tested.
