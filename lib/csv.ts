import Papa from "papaparse";

export interface CsvParseResult {
  labels: string[];
  seriesNames: string[];
  data: number[][];
}

export function parseCsv(file: File): Promise<CsvParseResult> {
  return new Promise((resolve, reject) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete(results) {
        const records = results.data as Record<string, string>[];
        if (records.length === 0) {
          reject(new Error("CSV file is empty"));
          return;
        }

        const headers = Object.keys(records[0]);
        if (headers.length < 2) {
          reject(new Error("CSV must have at least 2 columns"));
          return;
        }

        // First column = labels, rest = data series
        const labelKey = headers[0];
        const seriesNames = headers.slice(1);
        const labels: string[] = [];
        const data: number[][] = [];

        records.forEach((record) => {
          labels.push(String(record[labelKey] ?? ""));
          const rowValues = seriesNames.map((key) => {
            const v = parseFloat(record[key]);
            return isNaN(v) ? 0 : v;
          });
          data.push(rowValues);
        });

        resolve({ labels, seriesNames, data });
      },
      error(err) {
        reject(err);
      },
    });
  });
}
