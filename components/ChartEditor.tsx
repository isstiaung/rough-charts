"use client";

import { useChartStore } from "@/lib/store";
import ChartCanvas from "./ChartCanvas";
import ChartTypeSelector from "./ChartTypeSelector";
import ChartOptionsPanel from "./ChartOptionsPanel";
import DataTable from "./DataTable";
import CsvImport from "./CsvImport";
import ExportButton from "./ExportButton";
import TitleInput from "./TitleInput";
import AxisLabelInput from "./AxisLabelInput";

export default function ChartEditor() {
  const xLabel = useChartStore((s) => s.xLabel);
  const yLabel = useChartStore((s) => s.yLabel);
  const setXLabel = useChartStore((s) => s.setXLabel);
  const setYLabel = useChartStore((s) => s.setYLabel);

  return (
    <div className="min-h-screen bg-base-200 p-4">
      <header className="text-center mb-4 max-w-7xl mx-auto">
        <h1 className="text-2xl font-bold">Hand Drawn Charts</h1>
        <p className="text-sm text-base-content/60">
          Create sketchy, hand-drawn style charts. Import CSV, edit data live,
          and export.
        </p>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_1fr_300px] gap-4 max-w-7xl mx-auto">
        {/* Left sidebar - controls */}
        <div className="flex flex-col gap-4 order-2 lg:order-1">
          <div className="card bg-base-100 shadow-sm p-4">
            <ChartTypeSelector />
          </div>
          <div className="card bg-base-100 shadow-sm p-4">
            <ChartOptionsPanel />
          </div>
          <div className="card bg-base-100 shadow-sm p-4">
            <ExportButton />
          </div>
        </div>

        {/* Center - chart */}
        <div className="flex flex-col gap-2 order-1 lg:order-2">
          <TitleInput />
          <div className="flex items-stretch gap-2">
            <div className="flex items-center">
              <AxisLabelInput
                value={yLabel}
                onChange={setYLabel}
                placeholder="Y Axis"
                vertical
              />
            </div>
            <div className="flex-1">
              <ChartCanvas />
            </div>
          </div>
          <AxisLabelInput
            value={xLabel}
            onChange={setXLabel}
            placeholder="X Axis Label"
          />
        </div>

        {/* Right sidebar - data */}
        <div className="flex flex-col gap-4 order-3">
          <div className="card bg-base-100 shadow-sm p-4">
            <CsvImport />
          </div>
          <div className="card bg-base-100 shadow-sm p-4 overflow-hidden">
            <label className="text-sm font-bold mb-2 block">Chart Data</label>
            <DataTable />
          </div>
        </div>
      </div>
    </div>
  );
}
