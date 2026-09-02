import { describe, expect, it } from "vitest";

import { loginSchema, registerSchema } from "./schemas";

describe("loginSchema", () => {
  it("accepts a valid email/password pair", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "anything",
    });
    expect(result.success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({
      email: "not-an-email",
      password: "anything",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({
      email: "user@example.com",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("rejects an email padded with whitespace (the `.email()` format check runs before `.trim()`)", () => {
    const result = loginSchema.safeParse({
      email: "  user@example.com  ",
      password: "anything",
    });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  const base = {
    name: "Jane Doe",
    email: "jane@example.com",
    password: "longenough1",
    confirmPassword: "longenough1",
  };

  it("accepts matching passwords of sufficient length", () => {
    expect(registerSchema.safeParse(base).success).toBe(true);
  });

  it("rejects mismatched passwords and blames confirmPassword", () => {
    const result = registerSchema.safeParse({
      ...base,
      confirmPassword: "different1",
    });
    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.issues[0].path).toEqual(["confirmPassword"]);
    }
  });

  it("rejects a password shorter than 8 characters", () => {
    const result = registerSchema.safeParse({
      ...base,
      password: "short1",
      confirmPassword: "short1",
    });
    expect(result.success).toBe(false);
  });

  it("rejects a blank name", () => {
    const result = registerSchema.safeParse({ ...base, name: "   " });
    expect(result.success).toBe(false);
  });

  it("rejects a name over 100 characters", () => {
    const result = registerSchema.safeParse({
      ...base,
      name: "a".repeat(101),
    });
    expect(result.success).toBe(false);
  });
});
