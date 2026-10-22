"use client";

import { useEffect, useRef, useState } from "react";
import { useChartStore } from "@/lib/store";

/**
 * Number input that keeps its raw text while focused, so clearing a cell
 * or typing "-" doesn't snap to 0 mid-edit. Commits every valid parse and
 * normalizes back to the stored value on blur.
 */
function NumberCell({
  value,
  onCommit,
  ariaLabel,
}: {
  value: number;
  onCommit: (value: number) => void;
  ariaLabel: string;
}) {
  const [text, setText] = useState(String(value));
  const focused = useRef(false);

  useEffect(() => {
    if (!focused.current) setText(String(value));
  }, [value]);

  return (
    <input
      type="number"
      inputMode="decimal"
      value={text}
      aria-label={ariaLabel}
      className="input input-xs input-ghost w-full min-w-[50px]"
      onFocus={() => {
        focused.current = true;
      }}
      onBlur={() => {
        focused.current = false;
        setText(String(value));
      }}
      onChange={(e) => {
        setText(e.target.value);
        const parsed = parseFloat(e.target.value);
        if (Number.isFinite(parsed)) onCommit(parsed);
      }}
    />
  );
}

export default function DataTable() {
  const rows = useChartStore((s) => s.rows);
  const seriesNames = useChartStore((s) => s.seriesNames);
  const setSeriesName = useChartStore((s) => s.setSeriesName);
  const setRowLabel = useChartStore((s) => s.setRowLabel);
  const setCellValue = useChartStore((s) => s.setCellValue);
  const addRow = useChartStore((s) => s.addRow);
  const deleteRow = useChartStore((s) => s.deleteRow);
  const addSeries = useChartStore((s) => s.addSeries);
  const deleteSeries = useChartStore((s) => s.deleteSeries);

  return (
    <div className="overflow-x-auto">
      <table className="table table-xs table-zebra">
        <thead>
          <tr>
            <th className="text-xs">Label</th>
            {seriesNames.map((name, i) => (
              <th key={i} className="relative">
                <input
                  type="text"
                  value={name}
                  aria-label={`Series ${i + 1} name`}
                  onChange={(e) => setSeriesName(i, e.target.value)}
                  className="input input-xs input-ghost w-full min-w-[60px] font-bold"
                />
                {seriesNames.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteSeries(i)}
                    className="btn btn-ghost btn-xs absolute -top-1 -right-1 text-error"
                    title="Delete series"
                    aria-label={`Delete series ${name || i + 1}`}
                  >
                    x
                  </button>
                )}
              </th>
            ))}
            <th>
              <button
                type="button"
                onClick={addSeries}
                className="btn btn-ghost btn-xs text-success"
                title="Add series"
                aria-label="Add series"
              >
                +
              </button>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row, rowIdx) => (
            <tr key={rowIdx}>
              <td>
                <input
                  type="text"
                  value={row.label}
                  aria-label={`Row ${rowIdx + 1} label`}
                  onChange={(e) => setRowLabel(rowIdx, e.target.value)}
                  className="input input-xs input-ghost w-full min-w-[50px]"
                />
              </td>
              {row.values.map((value, colIdx) => (
                <td key={colIdx}>
                  <NumberCell
                    value={value}
                    ariaLabel={`${seriesNames[colIdx] ?? `Series ${colIdx + 1}`} value for ${row.label || `row ${rowIdx + 1}`}`}
                    onCommit={(v) => setCellValue(rowIdx, colIdx, v)}
                  />
                </td>
              ))}
              <td>
                {rows.length > 1 && (
                  <button
                    type="button"
                    onClick={() => deleteRow(rowIdx)}
                    className="btn btn-ghost btn-xs text-error"
                    title="Delete row"
                    aria-label={`Delete row ${row.label || rowIdx + 1}`}
                  >
                    x
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button
        type="button"
        onClick={addRow}
        className="btn btn-sm btn-outline mt-2 w-full"
      >
        + Add Row
      </button>
    </div>
  );
}
