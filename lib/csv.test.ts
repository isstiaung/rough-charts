import { describe, it, expect } from "vitest";
import { parseCsvText, parseNumber } from "./csv";

describe("parseCsvText", () => {
  it("parses labels, series names, and numeric data", () => {
    const result = parseCsvText("Name,Plan,Reality\nAlan,10,20\nChris,30,40");
    expect(result.labels).toEqual(["Alan", "Chris"]);
    expect(result.seriesNames).toEqual(["Plan", "Reality"]);
    expect(result.data).toEqual([
      [10, 20],
      [30, 40],
    ]);
  });

  it("parses negative and decimal values", () => {
    const result = parseCsvText("Name,Delta\nQ1,-5.5\nQ2,3.25");
    expect(result.data).toEqual([[-5.5], [3.25]]);
  });

  it("turns non-numeric cells into 0", () => {
    const result = parseCsvText("Name,Value\nA,abc\nB,12");
    expect(result.data).toEqual([[0], [12]]);
  });

  it("turns missing cells into 0", () => {
    const result = parseCsvText("Name,X,Y\nA,1\nB,2,3");
    expect(result.data).toEqual([
      [1, 0],
      [2, 3],
    ]);
  });

  it("keeps duplicate row labels", () => {
    const result = parseCsvText("Name,Value\nSame,1\nSame,2");
    expect(result.labels).toEqual(["Same", "Same"]);
    expect(result.data).toEqual([[1], [2]]);
  });

  it("skips empty lines", () => {
    const result = parseCsvText("Name,Value\nA,1\n\nB,2\n");
    expect(result.labels).toEqual(["A", "B"]);
  });

  it("throws on empty input", () => {
    expect(() => parseCsvText("")).toThrow("No data rows found");
    expect(() => parseCsvText("Name,Value")).toThrow("No data rows found");
  });

  it("throws when there are fewer than 2 columns", () => {
    expect(() => parseCsvText("Name\nA\nB")).toThrow("Need at least 2 columns");
  });

  it("reads quoted values with thousands separators and currency", () => {
    const result = parseCsvText(
      'Region,Revenue\nNorth,"1,500,000"\nSouth,"$1,200"'
    );
    expect(result.data).toEqual([[1500000], [1200]]);
  });

  it("parses tab-separated cells pasted from a spreadsheet", () => {
    const result = parseCsvText(
      "Region\tRevenue\tCosts\r\nNorth\t1,500\t900\r\nSouth\t1,200\t1,100\r\n"
    );
    expect(result.seriesNames).toEqual(["Revenue", "Costs"]);
    expect(result.labels).toEqual(["North", "South"]);
    expect(result.data).toEqual([
      [1500, 900],
      [1200, 1100],
    ]);
  });

  it("trims header whitespace", () => {
    expect(parseCsvText("Name , Value \nA,1").seriesNames).toEqual(["Value"]);
  });

  it("rejects data beyond the row limit", () => {
    const text = "Name,Value\n" + "A,1\n".repeat(1001);
    expect(() => parseCsvText(text)).toThrow("Too many rows");
  });
});

describe("parseNumber", () => {
  it.each([
    ["42", 42],
    ["-5.5", -5.5],
    [" 7 ", 7],
    ["1,234.5", 1234.5],
    ["$1,200", 1200],
    ["€99", 99],
    ["45%", 45],
    ["(1,200)", -1200],
    ["\u22123", -3],
    ["1e3", 1000],
    [".5", 0.5],
  ])("reads %j as %d", (raw, expected) => {
    expect(parseNumber(raw)).toBe(expected);
  });

  it.each(["", "abc", "12abc", "0x10", "1.2.3", "Infinity", "-"])(
    "rejects %j",
    (raw) => {
      expect(parseNumber(raw)).toBeNaN();
    }
  );
});
