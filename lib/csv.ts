import Papa from "papaparse";

export interface CsvParseResult {
  labels: string[];
  seriesNames: string[];
  data: number[][];
}

/**
 * Parses CSV text: first column = row labels, remaining columns = data
 * series. Non-numeric cells become 0.
 */
export function parseCsvText(text: string): CsvParseResult {
  const results = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: true,
  });

  const records = results.data;
  if (records.length === 0) {
    throw new Error("CSV file is empty");
  }

  const headers = results.meta.fields ?? Object.keys(records[0]);
  if (headers.length < 2) {
    throw new Error("CSV must have at least 2 columns");
  }

  const labelKey = headers[0];
  const seriesNames = headers.slice(1);
  const labels: string[] = [];
  const data: number[][] = [];

  records.forEach((record) => {
    labels.push(String(record[labelKey] ?? ""));
    const rowValues = seriesNames.map((key) => {
      const value = parseFloat(record[key]);
      return isNaN(value) ? 0 : value;
    });
    data.push(rowValues);
  });

  return { labels, seriesNames, data };
}

export async function parseCsvFile(file: File): Promise<CsvParseResult> {
  return parseCsvText(await file.text());
}
