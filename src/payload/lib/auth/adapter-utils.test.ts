import { describe, expect, test } from "bun:test";
import {
  camelToSnake,
  camelToSnakeKeys,
  getCollection,
  MODEL_MAP,
  OPERATOR_MAP,
  snakeToCamel,
  snakeToCamelKeys,
  transformOutput,
  translateWhere,
} from "./adapter-utils";

// ---------------------------------------------------------------------------
// Model mapping
// ---------------------------------------------------------------------------
describe("getCollection", () => {
  test("maps BA model names to Payload collection slugs", () => {
    expect(getCollection("user")).toBe("users");
    expect(getCollection("session")).toBe("ba-sessions");
    expect(getCollection("account")).toBe("ba-accounts");
    expect(getCollection("verification")).toBe("ba-verifications");
    expect(getCollection("twoFactor")).toBe("ba-two-factors");
  });

  test("returns model name unchanged if not in map", () => {
    expect(getCollection("unknown")).toBe("unknown");
  });

  test("MODEL_MAP has exactly 5 entries", () => {
    expect(Object.keys(MODEL_MAP)).toHaveLength(5);
  });
});

// ---------------------------------------------------------------------------
// Field-name conversion
// ---------------------------------------------------------------------------
describe("snakeToCamel", () => {
  test("converts snake_case to camelCase", () => {
    expect(snakeToCamel("user_id")).toBe("userId");
    expect(snakeToCamel("access_token_expires_at")).toBe(
      "accessTokenExpiresAt"
    );
    expect(snakeToCamel("email_verified")).toBe("emailVerified");
    expect(snakeToCamel("created_at")).toBe("createdAt");
  });

  test("leaves already camelCase strings unchanged", () => {
    expect(snakeToCamel("userId")).toBe("userId");
    expect(snakeToCamel("email")).toBe("email");
  });

  test("handles single-word strings", () => {
    expect(snakeToCamel("token")).toBe("token");
    expect(snakeToCamel("id")).toBe("id");
  });
});

describe("camelToSnake", () => {
  test("converts camelCase to snake_case", () => {
    expect(camelToSnake("userId")).toBe("user_id");
    expect(camelToSnake("accessTokenExpiresAt")).toBe(
      "access_token_expires_at"
    );
    expect(camelToSnake("emailVerified")).toBe("email_verified");
    expect(camelToSnake("createdAt")).toBe("created_at");
  });

  test("leaves already snake_case strings unchanged", () => {
    expect(camelToSnake("user_id")).toBe("user_id");
    expect(camelToSnake("email")).toBe("email");
  });
});

describe("snakeToCamelKeys", () => {
  test("converts all keys from snake_case to camelCase", () => {
    const input = {
      user_id: 1,
      access_token: "abc",
      expires_at: "2026-01-01",
    };
    expect(snakeToCamelKeys(input)).toEqual({
      userId: 1,
      accessToken: "abc",
      expiresAt: "2026-01-01",
    });
  });

  test("preserves values unchanged", () => {
    const input = { some_key: { nested: true } };
    expect(snakeToCamelKeys(input)).toEqual({ someKey: { nested: true } });
  });
});

describe("camelToSnakeKeys", () => {
  test("converts all keys from camelCase to snake_case", () => {
    const input = { userId: 1, accessToken: "abc", expiresAt: "2026-01-01" };
    expect(camelToSnakeKeys(input)).toEqual({
      user_id: 1,
      access_token: "abc",
      expires_at: "2026-01-01",
    });
  });
});

// ---------------------------------------------------------------------------
// Where-clause translation
// ---------------------------------------------------------------------------
describe("translateWhere", () => {
  test("returns empty object for empty array", () => {
    expect(translateWhere([])).toEqual({});
  });

  test("translates single eq clause", () => {
    const result = translateWhere([
      {
        field: "email",
        operator: "eq",
        value: "test@test.com",
        connector: "AND",
      },
    ]);
    expect(result).toEqual({ email: { equals: "test@test.com" } });
  });

  test("translates snake_case field names to camelCase", () => {
    const result = translateWhere([
      { field: "user_id", operator: "eq", value: 1, connector: "AND" },
    ]);
    expect(result).toEqual({ userId: { equals: 1 } });
  });

  test("translates all BA operators to Payload operators", () => {
    for (const [baOp, payloadOp] of Object.entries(OPERATOR_MAP)) {
      if (baOp === "starts_with" || baOp === "ends_with") {
        continue; // tested separately due to value transformation
      }
      const result = translateWhere([
        { field: "name", operator: baOp, value: "test", connector: "AND" },
      ]);
      expect(result).toEqual({ name: { [payloadOp]: "test" } });
    }
  });

  test("starts_with appends % wildcard", () => {
    const result = translateWhere([
      {
        field: "token",
        operator: "starts_with",
        value: "abc",
        connector: "AND",
      },
    ]);
    expect(result).toEqual({ token: { like: "abc%" } });
  });

  test("ends_with prepends % wildcard", () => {
    const result = translateWhere([
      { field: "token", operator: "ends_with", value: "xyz", connector: "AND" },
    ]);
    expect(result).toEqual({ token: { like: "%xyz" } });
  });

  test("groups multiple AND clauses", () => {
    const result = translateWhere([
      { field: "email", operator: "eq", value: "a@b.com", connector: "AND" },
      { field: "role", operator: "eq", value: "admin", connector: "AND" },
    ]);
    expect(result).toEqual({
      and: [{ email: { equals: "a@b.com" } }, { role: { equals: "admin" } }],
    });
  });

  test("handles OR connector by creating separate groups", () => {
    const result = translateWhere([
      { field: "email", operator: "eq", value: "a@b.com", connector: "AND" },
      { field: "role", operator: "eq", value: "admin", connector: "OR" },
    ]);
    expect(result).toEqual({
      or: [{ email: { equals: "a@b.com" } }, { role: { equals: "admin" } }],
    });
  });

  test("handles mixed AND/OR with grouping", () => {
    const result = translateWhere([
      { field: "a", operator: "eq", value: 1, connector: "AND" },
      { field: "b", operator: "eq", value: 2, connector: "AND" },
      { field: "c", operator: "eq", value: 3, connector: "OR" },
      { field: "d", operator: "eq", value: 4, connector: "AND" },
    ]);
    expect(result).toEqual({
      or: [
        { and: [{ a: { equals: 1 } }, { b: { equals: 2 } }] },
        { and: [{ c: { equals: 3 } }, { d: { equals: 4 } }] },
      ],
    });
  });

  test("falls back to 'equals' for unknown operators", () => {
    const result = translateWhere([
      { field: "x", operator: "unknown_op", value: "v", connector: "AND" },
    ]);
    expect(result).toEqual({ x: { equals: "v" } });
  });
});

// ---------------------------------------------------------------------------
// Output transformation
// ---------------------------------------------------------------------------
describe("transformOutput", () => {
  test("converts camelCase keys to snake_case", () => {
    const input = { userId: 1, accessToken: "abc", expiresAt: "2026-01-01" };
    const result = transformOutput(input);
    expect(result).toEqual({
      user_id: 1,
      access_token: "abc",
      expires_at: "2026-01-01",
    });
  });

  test("stringifies the id field", () => {
    const result = transformOutput({ id: 42, name: "Test" });
    expect(result).toEqual({ id: "42", name: "Test" });
  });

  test("returns null/undefined unchanged", () => {
    expect(transformOutput(null)).toBeNull();
    expect(transformOutput(undefined)).toBeUndefined();
  });

  test("returns primitives unchanged", () => {
    expect(transformOutput("string")).toBe("string");
    expect(transformOutput(123)).toBe(123);
  });
});
