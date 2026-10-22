"use client";

import { undo, useChartStore } from "@/lib/store";
import ChartCanvas from "./ChartCanvas";
import ChartTypeSelector from "./ChartTypeSelector";
import ChartOptionsPanel from "./ChartOptionsPanel";
import DataTable from "./DataTable";
import CsvImport from "./CsvImport";
import ExportButton from "./ExportButton";
import ShareButton from "./ShareButton";
import DebouncedInput from "./DebouncedInput";
import { useSharedChartLink, useUndoShortcuts } from "./hooks";

export default function ChartEditor() {
  const title = useChartStore((s) => s.title);
  const xLabel = useChartStore((s) => s.xLabel);
  const yLabel = useChartStore((s) => s.yLabel);
  const setTitle = useChartStore((s) => s.setTitle);
  const setXLabel = useChartStore((s) => s.setXLabel);
  const setYLabel = useChartStore((s) => s.setYLabel);

  useUndoShortcuts();
  const [sharedLink, dismissSharedLink] = useSharedChartLink();

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <header className="text-center mb-4 max-w-7xl mx-auto">
        <div className="flex items-center justify-center gap-2">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src="/logo.svg" alt="" className="w-9 h-9" />
          <h1 className="text-2xl font-bold">Hand Drawn Charts</h1>
        </div>
        <p className="text-sm text-base-content/60">
          Create sketchy, hand-drawn style charts. Import CSV, edit data live,
          and export.
        </p>
      </header>

      {sharedLink && (
        <div
          role="status"
          className={`alert ${sharedLink === "loaded" ? "alert-info" : "alert-error"} max-w-7xl mx-auto mb-4`}
        >
          <span>
            {sharedLink === "loaded"
              ? "You're viewing a shared chart. It replaced the chart you had open; undo to get yours back."
              : "That share link couldn't be read. It may be incomplete."}
          </span>
          <div className="flex gap-2">
            {sharedLink === "loaded" && (
              <button
                type="button"
                className="btn btn-sm"
                onClick={() => {
                  undo();
                  dismissSharedLink();
                }}
              >
                Undo
              </button>
            )}
            <button
              type="button"
              className="btn btn-sm btn-ghost"
              onClick={dismissSharedLink}
            >
              Dismiss
            </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-4 max-w-7xl mx-auto">
        {/* Left sidebar - controls */}
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          <div className="card bg-base-100 shadow-sm p-4">
            <ChartTypeSelector />
          </div>
          <div className="card bg-base-100 shadow-sm p-4">
            <ChartOptionsPanel />
          </div>
          <div className="card bg-base-100 shadow-sm p-4 flex flex-col gap-2">
            <ExportButton />
            <ShareButton />
          </div>
        </div>

        {/* Center - chart */}
        <div className="flex flex-col gap-2 order-1 lg:order-2">
          <DebouncedInput
            value={title}
            onChange={setTitle}
            placeholder="Chart Title"
            aria-label="Chart title"
            className="input input-bordered w-full text-center text-lg font-bold"
          />
          <div className="flex items-stretch gap-2">
            <div className="flex items-center justify-center w-8">
              <DebouncedInput
                value={yLabel}
                onChange={setYLabel}
                placeholder="Y Axis"
                aria-label="Y axis label"
                className="input input-bordered input-sm text-center origin-center -rotate-90 w-40"
              />
            </div>
            <div className="flex-1">
              <ChartCanvas />
            </div>
          </div>
          <DebouncedInput
            value={xLabel}
            onChange={setXLabel}
            placeholder="X Axis Label"
            aria-label="X axis label"
            className="input input-bordered input-sm w-full text-center"
          />
        </div>

        {/* Right sidebar - data */}
        <div className="flex flex-col gap-4 order-3">
          <div className="card bg-base-100 shadow-sm p-4">
            <CsvImport />
          </div>
          <div className="card bg-base-100 shadow-sm p-4 overflow-hidden">
            <h2 className="text-sm font-bold mb-2">Chart Data</h2>
            <DataTable />
          </div>
        </div>
      </div>
    </div>
  );
}
