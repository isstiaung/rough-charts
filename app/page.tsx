"use client";

import dynamic from "next/dynamic";

const ChartEditor = dynamic(() => import("@/components/ChartEditor"), {
  ssr: false,
});

export default function Home() {
  return <ChartEditor />;
}
