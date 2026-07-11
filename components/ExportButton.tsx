"use client";

import { useEffect, useState } from "react";
import { exportChart, type ExportFormat } from "@/lib/export";
import { useChartStore } from "@/lib/store";

const formats: { value: ExportFormat; label: string }[] = [
  { value: "png", label: "PNG" },
  { value: "svg", label: "SVG" },
  { value: "jpeg", label: "JPEG" },
];

export default function ExportButton() {
  const title = useChartStore((s) => s.title);
  const [exporting, setExporting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!error) return;
    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const handleExport = async (format: ExportFormat) => {
    // Close the daisyUI focus-based dropdown
    (document.activeElement as HTMLElement | null)?.blur();
    setExporting(true);
    setError(null);
    try {
      await exportChart(format, title);
    } catch (err) {
      console.error("Export failed:", err);
      setError("Export failed. Please try again.");
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
            <button type="button" onClick={() => handleExport(f.value)}>
              {f.label}
            </button>
          </li>
        ))}
      </ul>

      {error && (
        <div className="toast toast-end z-50">
          <div role="alert" className="alert alert-error text-sm">
            {error}
          </div>
        </div>
      )}
    </div>
  );
}
