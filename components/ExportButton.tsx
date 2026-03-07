"use client";

import { useState } from "react";
import { exportChart, type ExportFormat } from "@/lib/export";

const formats: { value: ExportFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "svg", label: "SVG" },
  { value: "jpeg", label: "JPEG" },
];

export default function ExportButton() {
  const [exporting, setExporting] = useState(false);

  const handleExport = async (format: ExportFormat) => {
    setExporting(true);
    try {
      await exportChart(format);
    } catch (err) {
      console.error("Export failed:", err);
    } finally {
      setExporting(false);
    }
  };

  return (
    <div className="dropdown dropdown-end w-full">
      <div
        tabIndex={0}
        role="button"
        className="btn btn-sm btn-secondary w-full"
      >
        {exporting ? "Exporting..." : "Export"}
      </div>
      <ul
        tabIndex={0}
        className="dropdown-content menu bg-base-100 rounded-box z-10 w-36 p-2 shadow-sm"
      >
        {formats.map((f) => (
          <li key={f.value}>
            <a onClick={() => handleExport(f.value)}>{f.label}</a>
          </li>
        ))}
      </ul>
    </div>
  );
}
