"use client";

import { useCallback, useState, useRef } from "react";
import { parseCsvFile } from "@/lib/csv";
import { useChartStore } from "@/lib/store";

export default function CsvImport() {
  const importCsvData = useChartStore((s) => s.importCsvData);
  const [dragging, setDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback(
    async (file: File) => {
      setError(null);
      try {
        const { labels, seriesNames, data } = await parseCsvFile(file);
        importCsvData(labels, seriesNames, data);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed to parse CSV");
      }
    },
    [importCsvData]
  );

  const onDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragging(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const onFileChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-bold">Import CSV</label>
      <div
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
          dragging
            ? "border-primary bg-primary/10"
            : "border-base-300 hover:border-primary"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={() => setDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <p className="text-sm">Drop CSV here or click to upload</p>
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={onFileChange}
          className="hidden"
        />
      </div>
      {error && <p className="text-error text-xs">{error}</p>}
    </div>
  );
}
