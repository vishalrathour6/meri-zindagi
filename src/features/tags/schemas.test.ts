import { describe, expect, it } from "vitest";

import { createTagSchema } from "./schemas";

describe("createTagSchema", () => {
  it("accepts a name without a color", () => {
    expect(createTagSchema.safeParse({ name: "Work" }).success).toBe(true);
  });

  it("accepts a name with a valid palette color", () => {
    expect(
      createTagSchema.safeParse({ name: "Work", color: "blue" }).success,
    ).toBe(true);
  });

  it("rejects a color outside the fixed palette", () => {
    expect(
      createTagSchema.safeParse({ name: "Work", color: "magenta" }).success,
    ).toBe(false);
  });

  it("rejects a blank name", () => {
    expect(createTagSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("rejects a name over 50 characters", () => {
    expect(createTagSchema.safeParse({ name: "a".repeat(51) }).success).toBe(
      false,
    );
  });
});
