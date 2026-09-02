import { describe, expect, it } from "vitest";

import { createTaskSchema, taskQuerySchema, updateTaskSchema } from "./schemas";

describe("createTaskSchema", () => {
  it("accepts a minimal valid task", () => {
    expect(createTaskSchema.safeParse({ title: "Buy milk" }).success).toBe(
      true,
    );
  });

  it("rejects a blank title", () => {
    expect(createTaskSchema.safeParse({ title: "   " }).success).toBe(false);
  });

  it("rejects a title over 200 characters", () => {
    expect(
      createTaskSchema.safeParse({ title: "a".repeat(201) }).success,
    ).toBe(false);
  });

  it("accepts a valid YYYY-MM-DD due date", () => {
    expect(
      createTaskSchema.safeParse({ title: "Task", dueDate: "2026-09-01" })
        .success,
    ).toBe(true);
  });

  it("rejects a malformed due date", () => {
    expect(
      createTaskSchema.safeParse({ title: "Task", dueDate: "09/01/2026" })
        .success,
    ).toBe(false);
  });

  it("rejects an invalid priority", () => {
    expect(
      createTaskSchema.safeParse({ title: "Task", priority: "Urgent" })
        .success,
    ).toBe(false);
  });

  it("accepts a null due date", () => {
    expect(
      createTaskSchema.safeParse({ title: "Task", dueDate: null }).success,
    ).toBe(true);
  });
});

describe("updateTaskSchema", () => {
  it("accepts a single-field update", () => {
    expect(updateTaskSchema.safeParse({ status: "Completed" }).success).toBe(
      true,
    );
  });

  it("rejects an empty update body", () => {
    const result = updateTaskSchema.safeParse({});
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("Nothing to update");
    }
  });

  it("rejects an invalid status value", () => {
    expect(updateTaskSchema.safeParse({ status: "Archived" }).success).toBe(
      false,
    );
  });
});

describe("taskQuerySchema", () => {
  it("defaults page to 1 and pageSize to 100 when omitted", () => {
    const result = taskQuerySchema.safeParse({});
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(1);
      expect(result.data.pageSize).toBe(100);
    }
  });

  it("coerces string page/pageSize from URLSearchParams into numbers", () => {
    const result = taskQuerySchema.safeParse({ page: "2", pageSize: "50" });
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.page).toBe(2);
      expect(result.data.pageSize).toBe(50);
    }
  });

  it("rejects a page below 1", () => {
    expect(taskQuerySchema.safeParse({ page: "0" }).success).toBe(false);
  });

  it("rejects a pageSize above 100", () => {
    expect(taskQuerySchema.safeParse({ pageSize: "101" }).success).toBe(false);
  });

  it("rejects an invalid status filter", () => {
    expect(taskQuerySchema.safeParse({ status: "Archived" }).success).toBe(
      false,
    );
  });
});
