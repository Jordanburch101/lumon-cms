import type { Where as PayloadWhere } from "payload";

/**
 * Pure utility functions for the Better Auth ↔ Payload adapter.
 * Extracted for testability — no Payload or BA runtime dependencies.
 */

// ---------------------------------------------------------------------------
// Model-name mapping: Better Auth internal names → Payload collection slugs
// ---------------------------------------------------------------------------
export const MODEL_MAP: Record<string, string> = {
  user: "users",
  session: "ba-sessions",
  account: "ba-accounts",
  verification: "ba-verifications",
  twoFactor: "ba-two-factors",
};

export function getCollection(model: string): string {
  return MODEL_MAP[model] ?? model;
}

// ---------------------------------------------------------------------------
// Operator mapping: Better Auth operators → Payload where operators
// ---------------------------------------------------------------------------
export const OPERATOR_MAP: Record<string, string> = {
  eq: "equals",
  ne: "not_equals",
  lt: "less_than",
  lte: "less_than_equal",
  gt: "greater_than",
  gte: "greater_than_equal",
  in: "in",
  not_in: "not_in",
  contains: "contains",
  starts_with: "like",
  ends_with: "like",
};

// ---------------------------------------------------------------------------
// Field-name mapping: snake_case ↔ camelCase
// ---------------------------------------------------------------------------
export function snakeToCamel(s: string): string {
  return s.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
}

export function camelToSnake(s: string): string {
  return s.replace(/[A-Z]/g, (c) => `_${c.toLowerCase()}`);
}

export function snakeToCamelKeys(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[snakeToCamel(key)] = value;
  }
  return result;
}

export function camelToSnakeKeys(
  obj: Record<string, unknown>
): Record<string, unknown> {
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(obj)) {
    result[camelToSnake(key)] = value;
  }
  return result;
}

// ---------------------------------------------------------------------------
// Where-clause translation
// ---------------------------------------------------------------------------
interface CleanedWhere {
  connector: "AND" | "OR";
  field: string;
  operator: string;
  value: string | number | boolean | string[] | number[] | Date | null;
}

export function translateWhere(clauses: CleanedWhere[]): PayloadWhere {
  if (clauses.length === 0) {
    return {};
  }

  function toCondition(c: CleanedWhere): PayloadWhere {
    const op = OPERATOR_MAP[c.operator] ?? "equals";
    let value = c.value;

    if (c.operator === "starts_with") {
      value = `${String(value)}%`;
    } else if (c.operator === "ends_with") {
      value = `%${String(value)}`;
    }

    const fieldName = snakeToCamel(c.field);
    return { [fieldName]: { [op]: value } };
  }

  const groups: PayloadWhere[][] = [[]];
  let currentGroup = groups[0];

  for (const clause of clauses) {
    if (clause.connector === "OR" && currentGroup.length > 0) {
      const next: PayloadWhere[] = [];
      groups.push(next);
      currentGroup = next;
    }
    currentGroup.push(toCondition(clause));
  }

  if (groups.length === 1) {
    const g = groups[0];
    if (g.length === 1) {
      return g[0];
    }
    return { and: g };
  }

  const orClauses: PayloadWhere[] = groups.map((g) => {
    if (g.length === 1) {
      return g[0];
    }
    return { and: g };
  });

  return { or: orClauses };
}

// ---------------------------------------------------------------------------
// Output transformation: camelCase → snake_case + stringify IDs
// ---------------------------------------------------------------------------
export function transformOutput<T>(doc: T): T {
  if (!doc || typeof doc !== "object") {
    return doc;
  }
  const result: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(doc as Record<string, unknown>)) {
    const snakeKey = camelToSnake(key);
    result[snakeKey] = key === "id" ? String(value) : value;
  }
  return result as T;
}
