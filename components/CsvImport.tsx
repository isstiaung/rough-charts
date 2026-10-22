"use client";

import { useCallback, useEffect, useId, useRef, useState } from "react";
import { parseCsvFile, parseCsvText, type CsvParseResult } from "@/lib/csv";
import { useChartStore } from "@/lib/store";
import { isTextField } from "./hooks";

type Status = { kind: "success" | "error"; message: string } | null;

const ACCEPTED_FILES =
  ".csv,.tsv,.txt,text/csv,text/tab-separated-values,text/plain";

export default function CsvImport() {
  const importCsvData = useChartStore((s) => s.importCsvData);
  const [dragging, setDragging] = useState(false);
  const [pasteText, setPasteText] = useState("");
  const [status, setStatus] = useState<Status>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const pasteId = useId();

  const importFrom = useCallback(
    async (read: () => Promise<CsvParseResult>, source: string) => {
      try {
        const { labels, seriesNames, data } = await read();
        importCsvData(labels, seriesNames, data);
        const rows = `${labels.length} row${labels.length === 1 ? "" : "s"}`;
        setStatus({
          kind: "success",
          message: `Imported ${rows} × ${seriesNames.length} series from ${source}.`,
        });
        return true;
      } catch (err) {
        setStatus({
          kind: "error",
          message: err instanceof Error ? err.message : "Failed to read data",
        });
        return false;
      }
    },
    [importCsvData]
  );

  const importText = useCallback(
    (text: string) =>
      importFrom(async () => parseCsvText(text), "pasted cells"),
    [importFrom]
  );

  // Pasting anywhere outside a text field imports the clipboard
  useEffect(() => {
    const onPaste = (e: ClipboardEvent) => {
      if (isTextField(e.target)) return;
      const text = e.clipboardData?.getData("text/plain");
      if (!text?.trim()) return;
      e.preventDefault();
      importText(text);
    };
    document.addEventListener("paste", onPaste);
    return () => document.removeEventListener("paste", onPaste);
  }, [importText]);

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) importFrom(() => parseCsvFile(file), file.name);
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    // Clear the selection so picking the same file again still fires change
    e.target.value = "";
    if (file) importFrom(() => parseCsvFile(file), file.name);
  };

  return (
    <div className="flex flex-col gap-2">
      <h2 className="text-sm font-bold">Import Data</h2>
      <button
        type="button"
        className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors focus-visible:outline-2 focus-visible:outline-primary ${
          dragging
            ? "border-primary bg-primary/10"
            : "border-base-300 hover:border-primary"
        }`}
        onDragOver={(e) => {
          e.preventDefault();
          setDragging(true);
        }}
        onDragLeave={(e) => {
          // Moving onto a child fires dragleave on the parent; ignore it
          if (!e.currentTarget.contains(e.relatedTarget as Node | null)) {
            setDragging(false);
          }
        }}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
      >
        <span className="text-sm">Drop a CSV here or click to upload</span>
      </button>
      <input
        ref={fileInputRef}
        type="file"
        accept={ACCEPTED_FILES}
        onChange={onFileChange}
        className="hidden"
        tabIndex={-1}
        aria-hidden="true"
      />

      <label htmlFor={pasteId} className="text-xs text-base-content/70">
        Or paste cells from Excel / Google Sheets
      </label>
      <textarea
        id={pasteId}
        rows={2}
        value={pasteText}
        placeholder={"Label\tSeries 1\nA\t10"}
        className="textarea textarea-bordered textarea-sm w-full font-mono"
        onChange={(e) => setPasteText(e.target.value)}
        onPaste={(e) => {
          const text = e.clipboardData.getData("text/plain");
          if (!text.trim()) return;
          e.preventDefault();
          importText(text);
        }}
      />
      {pasteText.trim() && (
        <button
          type="button"
          className="btn btn-sm btn-outline"
          onClick={async () => {
            if (await importText(pasteText)) setPasteText("");
          }}
        >
          Import text
        </button>
      )}

      {status && (
        <p
          role={status.kind === "error" ? "alert" : "status"}
          className={`text-xs ${status.kind === "error" ? "text-error" : "text-base-content/70"}`}
        >
          {status.message}
        </p>
      )}
    </div>
  );
}
