"use client";

import { useChartStore } from "@/lib/store";

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
                  onChange={(e) => setSeriesName(i, e.target.value)}
                  className="input input-xs input-ghost w-full min-w-[60px] font-bold"
                />
                {seriesNames.length > 1 && (
                  <button
                    onClick={() => deleteSeries(i)}
                    className="btn btn-ghost btn-xs absolute -top-1 -right-1 text-error"
                    title="Delete series"
                  >
                    x
                  </button>
                )}
              </th>
            ))}
            <th>
              <button
                onClick={addSeries}
                className="btn btn-ghost btn-xs text-success"
                title="Add series"
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
                  onChange={(e) => setRowLabel(rowIdx, e.target.value)}
                  className="input input-xs input-ghost w-full min-w-[50px]"
                />
              </td>
              {row.values.map((value, colIdx) => (
                <td key={colIdx}>
                  <input
                    type="number"
                    value={value}
                    onChange={(e) => {
                      const v = parseFloat(e.target.value);
                      setCellValue(rowIdx, colIdx, isNaN(v) ? 0 : v);
                    }}
                    className="input input-xs input-ghost w-full min-w-[50px]"
                  />
                </td>
              ))}
              <td>
                {rows.length > 1 && (
                  <button
                    onClick={() => deleteRow(rowIdx)}
                    className="btn btn-ghost btn-xs text-error"
                    title="Delete row"
                  >
                    x
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <button onClick={addRow} className="btn btn-sm btn-outline mt-2 w-full">
        + Add Row
      </button>
    </div>
  );
}
