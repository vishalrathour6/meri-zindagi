import { describe, expect, it } from "vitest";

import { createDiarySchema, diaryQuerySchema, updateDiarySchema } from "./schemas";

describe("createDiarySchema", () => {
  it("accepts a valid entry", () => {
    expect(
      createDiarySchema.safeParse({ title: "Today", content: "It was fine." })
        .success,
    ).toBe(true);
  });

  it("rejects empty content", () => {
    expect(
      createDiarySchema.safeParse({ title: "Today", content: "   " }).success,
    ).toBe(false);
  });

  it("rejects a blank title", () => {
    expect(
      createDiarySchema.safeParse({ title: "   ", content: "It was fine." })
        .success,
    ).toBe(false);
  });

  it("accepts a valid mood", () => {
    expect(
      createDiarySchema.safeParse({
        title: "Today",
        content: "It was fine.",
        mood: "Happy",
      }).success,
    ).toBe(true);
  });

  it("accepts a null mood", () => {
    expect(
      createDiarySchema.safeParse({
        title: "Today",
        content: "It was fine.",
        mood: null,
      }).success,
    ).toBe(true);
  });

  it("rejects an invalid mood", () => {
    expect(
      createDiarySchema.safeParse({
        title: "Today",
        content: "It was fine.",
        mood: "Ecstatic",
      }).success,
    ).toBe(false);
  });
});

describe("updateDiarySchema", () => {
  it("accepts a single-field update", () => {
    expect(updateDiarySchema.safeParse({ mood: "Sad" }).success).toBe(true);
  });

  it("rejects an empty update body", () => {
    const result = updateDiarySchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Nothing to update");
    }
  });
});

describe("diaryQuerySchema", () => {
  it("defaults page to 1 and pageSize to 10 when omitted", () => {
    const result = diaryQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(10);
    }
  });

  it("accepts a valid YYYY-MM-DD date filter", () => {
    expect(diaryQuerySchema.safeParse({ date: "2026-08-31" }).success).toBe(
      true,
    );
  });

  it("rejects a malformed date filter", () => {
    expect(diaryQuerySchema.safeParse({ date: "31-08-2026" }).success).toBe(
      false,
    );
  });

  it("rejects an invalid mood filter", () => {
    expect(diaryQuerySchema.safeParse({ mood: "Ecstatic" }).success).toBe(
      false,
    );
  });
});
