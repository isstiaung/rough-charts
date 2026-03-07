"use client";

import { useRef } from "react";
import { useChartStore } from "@/lib/store";
import { useChartDimensions } from "./charts/shared/useChartDimensions";
import GroupedBarChart from "./charts/GroupedBarChart";
import StackedBarChart from "./charts/StackedBarChart";
import LineChart from "./charts/LineChart";

export default function ChartCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useChartDimensions(containerRef);

  const chartType = useChartStore((s) => s.chartType);
  const rows = useChartStore((s) => s.rows);
  const seriesNames = useChartStore((s) => s.seriesNames);
  const title = useChartStore((s) => s.title);
  const xLabel = useChartStore((s) => s.xLabel);
  const yLabel = useChartStore((s) => s.yLabel);
  const roughness = useChartStore((s) => s.roughness);
  const fillStyle = useChartStore((s) => s.fillStyle);

  const chartProps = {
    width,
    height,
    rows,
    seriesNames,
    title,
    xLabel,
    yLabel,
    roughness,
    fillStyle,
  };

  return (
    <div ref={containerRef} id="chart-container" className="w-full bg-white rounded-lg">
      {chartType === "grouped-bar" && <GroupedBarChart {...chartProps} />}
      {chartType === "stacked-bar" && <StackedBarChart {...chartProps} />}
      {chartType === "line" && <LineChart {...chartProps} />}
    </div>
  );
}
