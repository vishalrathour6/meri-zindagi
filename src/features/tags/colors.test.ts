import { describe, expect, it } from "vitest";

import {
  colorForName,
  tagColorClasses,
  TAG_COLOR_KEYS,
  TAG_COLORS,
} from "./colors";

describe("colorForName", () => {
  it("returns a key from the fixed palette", () => {
    expect(TAG_COLOR_KEYS).toContain(colorForName("work"));
  });

  it("is deterministic for the same name", () => {
    expect(colorForName("groceries")).toBe(colorForName("groceries"));
  });

  it("maps the empty string to the first palette key", () => {
    expect(colorForName("")).toBe(TAG_COLOR_KEYS[0]);
  });
});

describe("tagColorClasses", () => {
  it("returns the classes for a known color", () => {
    expect(tagColorClasses("blue")).toBe(TAG_COLORS.blue);
  });

  it("falls back to slate for an unknown color", () => {
    expect(tagColorClasses("not-a-real-color")).toBe(TAG_COLORS.slate);
  });
});
