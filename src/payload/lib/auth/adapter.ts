/**
 * Custom Better Auth adapter that uses Payload's Local API as the database layer.
 *
 * Known limitations:
 * - The `select` parameter from BA is ignored — all queries return full documents.
 *   Payload's Local API `select` could be mapped for performance, but is not critical.
 * - Offset-to-page conversion only works when offset is a multiple of limit.
 *   BA primarily uses limit-based queries without offset, so this rarely triggers.
 */
import { createAdapterFactory } from "better-auth/adapters";
import type { Payload } from "payload";
import {
  getCollection,
  snakeToCamel,
  snakeToCamelKeys,
  transformOutput,
  translateWhere,
} from "./adapter-utils";

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

      const createData = snakeToCamelKeys(data as Record<string, unknown>);

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

      return transformOutput(doc) as unknown as typeof data;
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
      return (doc ? transformOutput(doc) : null) as never;
    },

    async findMany({ model, where, limit, sortBy, offset }) {
      const payload = await getPayloadLazy();
      const collection = getCollection(model);

      let sort: string | undefined;
      if (sortBy) {
        const field = snakeToCamel(sortBy.field);
        sort = sortBy.direction === "desc" ? `-${field}` : field;
      }

      const result = await payload.find({
        collection: collection as "users",
        where: where ? translateWhere(where) : {},
        limit: limit ?? 100,
        sort,
        // Note: offset-to-page only correct when offset is a multiple of limit
        page:
          offset === undefined
            ? undefined
            : Math.floor(offset / (limit ?? 100)) + 1,
        depth: 0,
        overrideAccess: true,
      });

      return result.docs.map(transformOutput) as never;
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
        data: snakeToCamelKeys(update as Record<string, unknown>) as never,
        depth: 0,
        overrideAccess: true,
      });

      const doc = result.docs[0] ?? null;
      return (doc ? transformOutput(doc) : null) as never;
    },

    async updateMany({ model, where, update }) {
      const payload = await getPayloadLazy();
      const collection = getCollection(model);

      const result = await payload.update({
        collection: collection as "users",
        where: translateWhere(where),
        data: snakeToCamelKeys(update as Record<string, unknown>) as never,
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
