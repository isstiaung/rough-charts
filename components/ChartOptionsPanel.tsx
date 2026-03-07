"use client";

import { useChartStore } from "@/lib/store";
import type { FillStyle } from "@/lib/types";

const fillStyles: { value: FillStyle; label: string }[] = [
  { value: "hachure", label: "Hachure" },
  { value: "solid", label: "Solid" },
  { value: "zigzag", label: "Zigzag" },
  { value: "cross-hatch", label: "Cross Hatch" },
  { value: "dots", label: "Dots" },
  { value: "dashed", label: "Dashed" },
];

export default function ChartOptionsPanel() {
  const roughness = useChartStore((s) => s.roughness);
  const fillStyle = useChartStore((s) => s.fillStyle);
  const setRoughness = useChartStore((s) => s.setRoughness);
  const setFillStyle = useChartStore((s) => s.setFillStyle);
  const resetToDefaults = useChartStore((s) => s.resetToDefaults);

  return (
    <div className="flex flex-col gap-3">
      <div>
        <label className="text-sm font-bold">
          Roughness: {roughness.toFixed(1)}
        </label>
        <input
          type="range"
          min="0"
          max="4"
          step="0.1"
          value={roughness}
          onChange={(e) => setRoughness(parseFloat(e.target.value))}
          className="range range-xs range-primary"
        />
      </div>

      <div>
        <label className="text-sm font-bold">Fill Style</label>
        <select
          value={fillStyle}
          onChange={(e) => setFillStyle(e.target.value as FillStyle)}
          className="select select-sm select-bordered w-full"
        >
          {fillStyles.map((fs) => (
            <option key={fs.value} value={fs.value}>
              {fs.label}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={resetToDefaults}
        className="btn btn-sm btn-outline btn-warning"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
