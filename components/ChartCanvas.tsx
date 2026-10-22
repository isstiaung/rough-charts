"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useChartStore } from "@/lib/store";
import { useChartDimensions } from "./charts/shared/useChartDimensions";
import { FONT_FAMILY, FONT_NAME } from "./charts/shared/config";
import { formatValue } from "./charts/shared/format";
import RoughChart from "./charts/RoughChart";
import type { TooltipData } from "@/lib/types";

/** True once the chart font is loaded (or failed to), so text measures right. */
function useChartFontLoaded() {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    let active = true;
    const done = () => {
      if (active) setLoaded(true);
    };
    document.fonts.load(`14px ${FONT_NAME}`).then(done, done);
    return () => {
      active = false;
    };
  }, []);

  return loaded;
}

export default function ChartCanvas() {
  const containerRef = useRef<HTMLDivElement>(null);
  const { width, height } = useChartDimensions(containerRef);
  const fontLoaded = useChartFontLoaded();
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

  // Tapping elsewhere or pressing Escape dismisses the tooltip
  useEffect(() => {
    if (!tooltip) return;
    const onPointerDown = (e: PointerEvent) => {
      if (!(e.target instanceof Element && e.target.closest(".row-target"))) {
        setTooltip(null);
      }
    };
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setTooltip(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [tooltip]);

  // Flip the tooltip to the other side of the pointer near the right/bottom
  const flipX = tooltip ? tooltip.x > width / 2 : false;
  const flipY = tooltip ? tooltip.y > height / 2 : false;

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
          fontLoaded={fontLoaded}
          onShowTooltip={showTooltip}
          onHideTooltip={hideTooltip}
        />
      )}

      {tooltip && (
        <div
          role="tooltip"
          className="absolute pointer-events-none bg-white border-2 border-black rounded-lg px-3 py-2 shadow-lg z-10 max-w-64"
          style={{
            left: tooltip.x + (flipX ? -12 : 12),
            top: tooltip.y + (flipY ? -12 : 12),
            transform: `translate(${flipX ? "-100%" : "0"}, ${flipY ? "-100%" : "0"})`,
            fontFamily: FONT_FAMILY,
          }}
        >
          <div className="font-bold text-sm mb-1 break-words">
            {tooltip.label}
          </div>
          {tooltip.items.map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className="w-3 h-3 rounded-sm inline-block shrink-0"
                style={{ backgroundColor: item.color }}
              />
              <span className="break-words">
                {item.name}: {formatValue(item.value)}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
