import Papa from "papaparse";
import { LIMITS, clampValue } from "./snapshot";

export interface CsvParseResult {
  labels: string[];
  seriesNames: string[];
  data: number[][];
}

const NUMBER_PATTERN = /^[-+]?(\d+\.?\d*|\.\d+)(e[-+]?\d+)?$/i;

/**
 * Reads a spreadsheet-style number, tolerating thousands separators, currency
 * symbols, percent signs, and accounting negatives like "(1,200)".
 * Returns NaN when the cell isn't a number.
 */
export function parseNumber(raw: string): number {
  let text = raw.trim().replace(/\u2212/g, "-");
  const accountingNegative = /^\(.*\)$/.test(text);
  if (accountingNegative) text = text.slice(1, -1);
  text = text.replace(/[\s,$€£¥%]/g, "");
  if (!NUMBER_PATTERN.test(text)) return NaN;
  const value = Number(text);
  return accountingNegative ? -value : value;
}

/**
 * Parses delimited text (a CSV file, or cells pasted from a spreadsheet,
 * which arrive tab-separated): first column = row labels, remaining columns =
 * data series. Non-numeric cells become 0.
 */
export function parseCsvText(text: string): CsvParseResult {
  const results = Papa.parse<Record<string, string>>(text, {
    header: true,
    skipEmptyLines: "greedy",
    // Papa's delimiter guess can pick "," inside "1,234" over real tabs
    delimiter: text.includes("\t") ? "\t" : "",
    transformHeader: (header) => header.trim(),
  });

  const records = results.data;
  if (records.length === 0) {
    throw new Error("No data rows found");
  }
  if (records.length > LIMITS.rows) {
    throw new Error(
      `Too many rows (${records.length}); the limit is ${LIMITS.rows}`
    );
  }

  const headers = results.meta.fields ?? Object.keys(records[0]);
  if (headers.length < 2) {
    throw new Error(
      "Need at least 2 columns: row labels, then one or more series"
    );
  }
  if (headers.length - 1 > LIMITS.series) {
    throw new Error(
      `Too many columns (${headers.length - 1} series); the limit is ${LIMITS.series}`
    );
  }

  const labelKey = headers[0];
  const seriesNames = headers
    .slice(1)
    .map((name) => name.slice(0, LIMITS.textLength));
  const labels: string[] = [];
  const data: number[][] = [];

  records.forEach((record) => {
    labels.push(String(record[labelKey] ?? "").slice(0, LIMITS.textLength));
    const rowValues = headers.slice(1).map((key) => {
      const value = parseNumber(String(record[key] ?? ""));
      return Number.isFinite(value) ? clampValue(value) : 0;
    });
    data.push(rowValues);
  });

  return { labels, seriesNames, data };
}

export async function parseCsvFile(file: File): Promise<CsvParseResult> {
  return parseCsvText(await file.text());
}
