import { describe, expect, it } from "vitest";

import { changePasswordSchema, updateProfileSchema } from "./schemas";

describe("updateProfileSchema", () => {
  it("accepts a valid name", () => {
    expect(updateProfileSchema.safeParse({ name: "Jane" }).success).toBe(true);
  });

  it("rejects a blank name", () => {
    expect(updateProfileSchema.safeParse({ name: "   " }).success).toBe(false);
  });

  it("rejects a name over 100 characters", () => {
    expect(
      updateProfileSchema.safeParse({ name: "a".repeat(101) }).success,
    ).toBe(false);
  });
});

describe("changePasswordSchema", () => {
  const base = {
    currentPassword: "current-pass",
    newPassword: "brand-new-pass",
    confirmPassword: "brand-new-pass",
  };

  it("accepts a valid password change", () => {
    expect(changePasswordSchema.safeParse(base).success).toBe(true);
  });

  it("rejects when confirmPassword doesn't match newPassword", () => {
    const result = changePasswordSchema.safeParse({
      ...base,
      confirmPassword: "something-else",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects when the new password matches the current one", () => {
    const result = changePasswordSchema.safeParse({
      currentPassword: "same-password",
      newPassword: "same-password",
      confirmPassword: "same-password",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["newPassword"]);
    }
  });

  it("rejects a new password shorter than 8 characters", () => {
    const result = changePasswordSchema.safeParse({
      ...base,
      newPassword: "short1",
      confirmPassword: "short1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty current password", () => {
    expect(
      changePasswordSchema.safeParse({ ...base, currentPassword: "" }).success,
    ).toBe(false);
  });
});
