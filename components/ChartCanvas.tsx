"use client";

import { useRef, useState, useCallback } from "react";
import { useChartStore } from "@/lib/store";
import { useChartDimensions } from "./charts/shared/useChartDimensions";
import RoughChart from "./charts/RoughChart";
import type { TooltipData } from "@/lib/types";

export default function ChartCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useChartDimensions(containerRef);
  const [tooltip, setTooltip] = useState<TooltipData | null>(null);

  const chartType = useChartStore((s) => s.chartType);
  const rows = useChartStore((s) => s.rows);
  const seriesNames = useChartStore((s) => s.seriesNames);
  const title = useChartStore((s) => s.title);
  const xLabel = useChartStore((s) => s.xLabel);
  const yLabel = useChartStore((s) => s.yLabel);
  const roughness = useChartStore((s) => s.roughness);
  const fillStyle = useChartStore((s) => s.fillStyle);
  const seed = useChartStore((s) => s.seed);

  const showTooltip = useCallback((data: TooltipData) => setTooltip(data), []);
  const hideTooltip = useCallback(() => setTooltip(null), []);

  return (
    <div
      ref={containerRef}
      id="chart-container"
      className="w-full bg-white rounded-lg relative overflow-hidden"
      style={{ minHeight: 300 }}
    >
      {width > 0 && (
        <RoughChart
          chartType={chartType}
          width={width}
          height={height}
          rows={rows}
          seriesNames={seriesNames}
          title={title}
          xLabel={xLabel}
          yLabel={yLabel}
          roughness={roughness}
          fillStyle={fillStyle}
          seed={seed}
          onShowTooltip={showTooltip}
          onHideTooltip={hideTooltip}
        />
      )}

      {tooltip && (
        <div
          className="absolute pointer-events-none bg-white border-2 border-black rounded-lg px-3 py-2 shadow-lg z-10"
          style={{
            left: Math.max(Math.min(tooltip.x + 10, width - 160), 0),
            top: Math.max(tooltip.y - 10, 0),
            fontFamily: "xkcd, cursive",
          }}
        >
          <div className="font-bold text-sm mb-1">{tooltip.label}</div>
          {tooltip.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-sm inline-block"
                style={{ backgroundColor: item.color }}
              />
              <span>
                {item.name}: {item.value}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
