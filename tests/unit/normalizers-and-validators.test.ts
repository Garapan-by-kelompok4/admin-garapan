import { describe, expect, it } from "vitest";

import {
  enumValue,
  nullableNumber,
  recordList,
} from "@/lib/api/normalizers";
import { loginSchema } from "@/lib/validators/auth";
import { createResolveDisputeSchema } from "@/lib/validators/disputes";

describe("normalizers", () => {
  it("recordList keeps only object records", () => {
    expect(recordList([{ id: "1" }, null, "x", [{ nested: true }]])).toEqual([
      { id: "1" },
    ]);
  });

  it("enumValue falls back when value is not allowed", () => {
    expect(enumValue("INVALID", ["A", "B"] as const, "A")).toBe("A");
    expect(enumValue("B", ["A", "B"] as const, "A")).toBe("B");
  });

  it("nullableNumber parses strings and rejects invalid values", () => {
    expect(nullableNumber("42")).toBe(42);
    expect(nullableNumber(null)).toBeNull();
    expect(nullableNumber("not-a-number")).toBeNull();
  });
});

describe("loginSchema", () => {
  it("rejects empty password", () => {
    const result = loginSchema.safeParse({
      email: "admin@garapan.test",
      password: "",
    });
    expect(result.success).toBe(false);
  });

  it("accepts valid credentials shape", () => {
    const result = loginSchema.safeParse({
      email: "admin@garapan.test",
      password: "secret",
    });
    expect(result.success).toBe(true);
  });
});

describe("createResolveDisputeSchema", () => {
  it("requires refund amount for partial refund", () => {
    const schema = createResolveDisputeSchema(1_000_000);
    const result = schema.safeParse({
      outcome: "PARTIAL_REFUND",
      resolutionNote: "Catatan",
      refundAmount: 0,
    });
    expect(result.success).toBe(false);
  });

  it("rejects partial refund above order amount", () => {
    const schema = createResolveDisputeSchema(500_000);
    const result = schema.safeParse({
      outcome: "PARTIAL_REFUND",
      resolutionNote: "Catatan",
      refundAmount: 600_000,
    });
    expect(result.success).toBe(false);
  });
});
