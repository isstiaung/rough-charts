import type { Metadata, Viewport } from "next";
import { preload } from "react-dom";
import "./globals.css";

const description =
  "Create sketchy, hand-drawn style charts in the browser. Import CSV, edit live, and export as PNG, SVG, or JPEG.";

// Only used to turn the OG/Twitter image paths into absolute URLs. Set
// NEXT_PUBLIC_SITE_URL in the build environment when deploying; see .env.example.
const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: "Hand Drawn Charts",
  description,
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "48x48" },
      { url: "/icon.svg", type: "image/svg+xml" },
    ],
    apple: "/apple-touch-icon.png",
  },
  openGraph: {
    title: "Hand Drawn Charts",
    description,
    url: "/",
    siteName: "Hand Drawn Charts",
    type: "website",
    images: [{ url: "/og.png", width: 1200, height: 630 }],
  },
  twitter: {
    card: "summary_large_image",
    title: "Hand Drawn Charts",
    description,
    images: ["/og.png"],
  },
};

export const viewport: Viewport = {
  themeColor: "#fdf8ee",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // The chart measures text to lay itself out, so fetch its font up front
  preload("/fonts/xkcd-script.woff2", {
    as: "font",
    type: "font/woff2",
    crossOrigin: "anonymous",
  });

  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
