import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Hand Drawn Charts",
  description: "Create beautiful hand-drawn style charts",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-theme="light">
      <body>{children}</body>
    </html>
  );
}
