import { describe, expect, it } from "vitest";

import { formatDateLabel, snippet, toDateParam } from "./format";

describe("toDateParam", () => {
  it("formats a local date as YYYY-MM-DD", () => {
    expect(toDateParam(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("pads single-digit months and days", () => {
    expect(toDateParam(new Date(2026, 8, 3))).toBe("2026-09-03");
  });

  it("does not shift across a year boundary", () => {
    expect(toDateParam(new Date(2025, 11, 31))).toBe("2025-12-31");
  });
});

describe("formatDateLabel", () => {
  it("formats a Date input", () => {
    const label = formatDateLabel(new Date(2026, 6, 10));
    expect(label).toContain("2026");
    expect(label).toContain("10");
  });

  it("formats a string input the same way as an equivalent Date", () => {
    expect(formatDateLabel("2026-07-10")).toBe(
      formatDateLabel(new Date("2026-07-10")),
    );
  });
});

describe("snippet", () => {
  it("returns short content unchanged", () => {
    expect(snippet("hello world")).toBe("hello world");
  });

  it("collapses internal whitespace and trims", () => {
    expect(snippet("  hello   \n\n world  ")).toBe("hello world");
  });

  it("truncates content longer than max and appends an ellipsis", () => {
    const long = "a".repeat(130);
    const result = snippet(long);
    expect(result.endsWith("…")).toBe(true);
    expect(result.length).toBe(121); // 120 chars + ellipsis
  });

  it("respects a custom max length", () => {
    expect(snippet("hello world", 5)).toBe("hello…");
  });

  it("does not truncate content exactly at max length", () => {
    const exact = "a".repeat(120);
    expect(snippet(exact)).toBe(exact);
  });
});
