import type { CleanedWhere } from "better-auth/adapters";
import { createAdapterFactory } from "better-auth/adapters";
import type { Payload, Where as PayloadWhere } from "payload";

// ---------------------------------------------------------------------------
// Model-name mapping: Better Auth internal names → Payload collection slugs
// ---------------------------------------------------------------------------
const MODEL_MAP: Record<string, string> = {
  user: "users",
  session: "ba-sessions",
  account: "ba-accounts",
  verification: "ba-verifications",
  twoFactor: "ba-two-factors",
};

function getCollection(model: string): string {
  return MODEL_MAP[model] ?? model;
}

// ---------------------------------------------------------------------------
// Lazy Payload singleton — avoids circular dep with @payload-config
// ---------------------------------------------------------------------------
let _payload: Payload | null = null;

async function getPayloadLazy(): Promise<Payload> {
  if (!_payload) {
    const { getPayload } = await import("payload");
    const config = (await import("@payload-config")).default;
    _payload = await getPayload({ config });
  }
  return _payload;
}

// ---------------------------------------------------------------------------
// Operator mapping: Better Auth operators → Payload where operators
// ---------------------------------------------------------------------------
const OPERATOR_MAP: Record<string, string> = {
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
// Where-clause translation
// ---------------------------------------------------------------------------
function translateWhere(clauses: CleanedWhere[]): PayloadWhere {
  if (clauses.length === 0) {
    return {};
  }

  function toCondition(c: CleanedWhere): PayloadWhere {
    const op = OPERATOR_MAP[c.operator] ?? "equals";
    let value = c.value;

    // Payload "like" uses SQL LIKE patterns
    if (c.operator === "starts_with") {
      value = `${String(value)}%`;
    } else if (c.operator === "ends_with") {
      value = `%${String(value)}`;
    }

    return { [c.field]: { [op]: value } };
  }

  // Walk left-to-right, grouping AND-connected clauses together.
  // When an OR connector appears, close the current AND group and start a new one.
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

  // Single group, all AND
  if (groups.length === 1) {
    const g = groups[0];
    if (g.length === 1) {
      return g[0];
    }
    return { and: g };
  }

  // Multiple groups joined by OR
  const orClauses: PayloadWhere[] = groups.map((g) => {
    if (g.length === 1) {
      return g[0];
    }
    return { and: g };
  });

  return { or: orClauses };
}

// ---------------------------------------------------------------------------
// Stringify IDs — Payload uses numeric IDs, BA expects strings
// ---------------------------------------------------------------------------
function stringifyId<T>(doc: T): T {
  if (doc && typeof doc === "object" && "id" in doc) {
    return { ...doc, id: String((doc as Record<string, unknown>).id) };
  }
  return doc;
}

// ---------------------------------------------------------------------------
// Payload adapter factory
// ---------------------------------------------------------------------------
export const payloadAdapter = createAdapterFactory({
  config: {
    adapterId: "payload",
    supportsNumericIds: true,
    disableIdGeneration: true,
    supportsBooleans: false,
    supportsDates: false,
    supportsJSON: false,
  },
  adapter: () => ({
    async create({ model, data }) {
      const payload = await getPayloadLazy();
      const collection = getCollection(model);

      const createData = { ...data } as Record<string, unknown>;

      // Payload's auth-enabled collections require a password on create.
      // BA stores passwords in the account table instead, so inject a random
      // throwaway password that will never be used for login.
      if (model === "user") {
        createData.password = crypto.randomUUID();
      }

      const doc = await payload.create({
        collection: collection as "users",
        data: createData as never,
        depth: 0,
        overrideAccess: true,
      });

      return stringifyId(doc) as typeof data;
    },

    async findOne({ model, where }) {
      const payload = await getPayloadLazy();
      const collection = getCollection(model);

      const result = await payload.find({
        collection: collection as "users",
        where: translateWhere(where),
        limit: 1,
        depth: 0,
        overrideAccess: true,
      });

      const doc = result.docs[0] ?? null;
      return doc ? stringifyId(doc) : null;
    },

    async findMany({ model, where, limit, sortBy, offset }) {
      const payload = await getPayloadLazy();
      const collection = getCollection(model);

      let sort: string | undefined;
      if (sortBy) {
        sort = sortBy.direction === "desc" ? `-${sortBy.field}` : sortBy.field;
      }

      const result = await payload.find({
        collection: collection as "users",
        where: where ? translateWhere(where) : {},
        limit: limit ?? 100,
        sort,
        page:
          offset === undefined
            ? undefined
            : Math.floor(offset / (limit ?? 100)) + 1,
        depth: 0,
        overrideAccess: true,
      });

      return result.docs.map(stringifyId) as never;
    },

    async count({ model, where }) {
      const payload = await getPayloadLazy();
      const collection = getCollection(model);

      const result = await payload.count({
        collection: collection as "users",
        where: where ? translateWhere(where) : {},
        overrideAccess: true,
      });

      return result.totalDocs;
    },

    async update({ model, where, update }) {
      const payload = await getPayloadLazy();
      const collection = getCollection(model);

      const result = await payload.update({
        collection: collection as "users",
        where: translateWhere(where),
        data: update as never,
        depth: 0,
        overrideAccess: true,
      });

      const doc = result.docs[0] ?? null;
      return doc ? stringifyId(doc) : null;
    },

    async updateMany({ model, where, update }) {
      const payload = await getPayloadLazy();
      const collection = getCollection(model);

      const result = await payload.update({
        collection: collection as "users",
        where: translateWhere(where),
        data: update as never,
        depth: 0,
        overrideAccess: true,
      });

      return result.docs.length;
    },

    async delete({ model, where }) {
      const payload = await getPayloadLazy();
      const collection = getCollection(model);

      await payload.delete({
        collection: collection as "users",
        where: translateWhere(where),
        depth: 0,
        overrideAccess: true,
      });
    },

    async deleteMany({ model, where }) {
      const payload = await getPayloadLazy();
      const collection = getCollection(model);

      const result = await payload.delete({
        collection: collection as "users",
        where: translateWhere(where),
        depth: 0,
        overrideAccess: true,
      });

      return result.docs.length;
    },
  }),
});
