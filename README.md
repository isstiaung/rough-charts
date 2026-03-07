# Hand Drawn Charts

Create sketchy, hand-drawn style charts in the browser. Import CSV data, edit live, and export as PNG/SVG/JPEG.

Built with Next.js 15, roughjs, D3, Tailwind 4, and daisyUI 5.

## Features

- **3 chart types**: Grouped Bar, Stacked Bar, Line
- **CSV import**: Drag-and-drop or click to upload
- **Live editing**: Edit data, labels, and titles directly on the page
- **Hand-drawn style**: Configurable roughness and fill styles via roughjs
- **Export**: Download charts as PNG, SVG, or JPEG
- **Auto-save**: Data persists in LocalStorage across sessions
- **Responsive**: Works on desktop and mobile

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

## Tech Stack

- **Framework**: Next.js 15 (App Router)
- **Charts**: roughjs + D3 v7
- **Styling**: Tailwind CSS 4 + daisyUI 5
- **State**: Zustand with LocalStorage persistence
- **CSV**: papaparse
- **Export**: html-to-image
- **Font**: XKCD Script (hand-drawn style)
