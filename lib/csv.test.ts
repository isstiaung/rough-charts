import { describe, it, expect } from "vitest";
import { parseCsvText } from "./csv";

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
    expect(() => parseCsvText("")).toThrow("CSV file is empty");
    expect(() => parseCsvText("Name,Value")).toThrow("CSV file is empty");
  });

  it("throws when there are fewer than 2 columns", () => {
    expect(() => parseCsvText("Name\nA\nB")).toThrow(
      "CSV must have at least 2 columns"
    );
  });
});
