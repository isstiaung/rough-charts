"use client";

import { useId } from "react";
import { useStore } from "zustand";
import { redo, undo, useChartStore } from "@/lib/store";
import type { FillStyle } from "@/lib/types";

const fillStyles: { value: FillStyle; label: string }[] = [
  { value: "hachure", label: "Hachure" },
  { value: "solid", label: "Solid" },
  { value: "zigzag", label: "Zigzag" },
  { value: "cross-hatch", label: "Cross Hatch" },
  { value: "dots", label: "Dots" },
  { value: "dashed", label: "Dashed" },
  { value: "zigzag-line", label: "Zigzag Line" },
];

export default function ChartOptionsPanel() {
  const roughness = useChartStore((s) => s.roughness);
  const fillStyle = useChartStore((s) => s.fillStyle);
  const setRoughness = useChartStore((s) => s.setRoughness);
  const setFillStyle = useChartStore((s) => s.setFillStyle);
  const regenerateSeed = useChartStore((s) => s.regenerateSeed);
  const resetToDefaults = useChartStore((s) => s.resetToDefaults);
  const canUndo = useStore(
    useChartStore.temporal,
    (s) => s.pastStates.length > 0
  );
  const canRedo = useStore(
    useChartStore.temporal,
    (s) => s.futureStates.length > 0
  );
  const roughnessId = useId();
  const fillStyleId = useId();

  return (
    <div className="flex flex-col gap-3">
      <div className="join w-full">
        <button
          type="button"
          onClick={undo}
          disabled={!canUndo}
          className="btn btn-sm btn-outline join-item flex-1"
          title="Undo (Ctrl+Z / ⌘Z)"
        >
          ↶ Undo
        </button>
        <button
          type="button"
          onClick={redo}
          disabled={!canRedo}
          className="btn btn-sm btn-outline join-item flex-1"
          title="Redo (Ctrl+Shift+Z / ⌘⇧Z)"
        >
          Redo ↷
        </button>
      </div>

      <div>
        <label htmlFor={roughnessId} className="text-sm font-bold">
          Roughness: {roughness.toFixed(1)}
        </label>
        <input
          id={roughnessId}
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
        <label htmlFor={fillStyleId} className="text-sm font-bold">
          Fill Style
        </label>
        <select
          id={fillStyleId}
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
        type="button"
        onClick={regenerateSeed}
        className="btn btn-sm btn-outline"
        title="Redraw the sketch strokes with new randomness"
      >
        🎲 Re-roll Sketch
      </button>

      <button
        type="button"
        onClick={() => {
          if (
            window.confirm(
              "Replace your chart with the sample data? You can undo this."
            )
          ) {
            resetToDefaults();
          }
        }}
        className="btn btn-sm btn-outline btn-warning"
      >
        Reset to Defaults
      </button>
    </div>
  );
}
