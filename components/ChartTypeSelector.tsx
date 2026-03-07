"use client";

import { useChartStore } from "@/lib/store";
import type { ChartType } from "@/lib/types";

const chartTypes: { value: ChartType; label: string }[] = [
  { value: "grouped-bar", label: "Grouped Bar" },
  { value: "stacked-bar", label: "Stacked Bar" },
  { value: "line", label: "Line" },
];

export default function ChartTypeSelector() {
  const chartType = useChartStore((s) => s.chartType);
  const setChartType = useChartStore((s) => s.setChartType);

  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm font-bold">Chart Type</label>
      <div className="join join-vertical w-full">
        {chartTypes.map((ct) => (
          <button
            key={ct.value}
            className={`btn join-item btn-sm ${
              chartType === ct.value ? "btn-primary" : "btn-outline"
            }`}
            onClick={() => setChartType(ct.value)}
          >
            {ct.label}
          </button>
        ))}
      </div>
    </div>
  );
}
