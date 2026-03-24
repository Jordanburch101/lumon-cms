/**
 * Tests for the Better Auth → Payload adapter.
 *
 * The adapter is wrapped by BA's `createAdapterFactory`, which applies
 * its own field/model transformations before calling our inner adapter.
 * We mock the Payload Local API and test through the full wrapped adapter
 * to verify the end-to-end integration.
 *
 * Key: BA's wrapper sends camelCase field names to our inner adapter, adds
 * default fields (emailVerified, createdAt, updatedAt), and manages the
 * model ↔ schema mapping. Our adapter then:
 *   1. Maps model names → Payload collection slugs (via getCollection)
 *   2. Converts data keys snake_case → camelCase (no-op when already camel)
 *   3. Injects a password for user model creates
 *   4. Transforms output back to snake_case with stringified IDs
 */
import { beforeEach, describe, expect, mock, test } from "bun:test";

// ---- Mock Payload Local API -------------------------------------------

const mockCreate = mock(() =>
  Promise.resolve({
    id: 1,
    email: "test@test.com",
    name: "Test User",
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-01T00:00:00.000Z",
  })
);

const mockFind = mock(() =>
  Promise.resolve({
    docs: [
      {
        id: 1,
        email: "test@test.com",
        name: "Test User",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    ],
    totalDocs: 1,
  })
);

const mockCount = mock(() => Promise.resolve({ totalDocs: 5 }));

const mockUpdate = mock(() =>
  Promise.resolve({
    docs: [
      {
        id: 1,
        email: "updated@test.com",
        name: "Updated",
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-02T00:00:00.000Z",
      },
    ],
  })
);

const mockDelete = mock(() =>
  Promise.resolve({
    docs: [{ id: 1 }, { id: 2 }],
  })
);

const mockPayload = {
  create: mockCreate,
  find: mockFind,
  count: mockCount,
  update: mockUpdate,
  delete: mockDelete,
};

mock.module("payload", () => ({
  getPayload: () => Promise.resolve(mockPayload),
}));

mock.module("@payload-config", () => ({
  default: {},
}));

// ---- Import adapter after mocks are established ----------------------

const { payloadAdapter } = await import("./adapter");

// createAdapterFactory returns: options → adapter object with CRUD methods.
const adapter = payloadAdapter({} as never);

// ---- Helpers ----------------------------------------------------------

function lastCallArgs(fn: ReturnType<typeof mock>) {
  const calls = fn.mock.calls;
  return calls.at(-1)?.[0] as Record<string, unknown>;
}

// ---- Tests ------------------------------------------------------------

beforeEach(() => {
  mockCreate.mockClear();
  mockFind.mockClear();
  mockCount.mockClear();
  mockUpdate.mockClear();
  mockDelete.mockClear();
});

// -----------------------------------------------------------------------
// create
// -----------------------------------------------------------------------
describe("create", () => {
  test("calls payload.create with depth 0 and overrideAccess", async () => {
    await adapter.create({
      model: "user",
      data: { email: "a@b.com", name: "A" },
    });

    expect(mockCreate).toHaveBeenCalledTimes(1);
    const args = lastCallArgs(mockCreate);
    expect(args.depth).toBe(0);
    expect(args.overrideAccess).toBe(true);
  });

  test("maps 'user' model to 'users' collection", async () => {
    await adapter.create({
      model: "user",
      data: { email: "a@b.com", name: "A" },
    });

    const args = lastCallArgs(mockCreate);
    expect(args.collection).toBe("users");
  });

  test("maps 'session' model to 'ba-sessions' collection", async () => {
    await adapter.create({
      model: "session",
      data: { token: "abc", userId: "1", expiresAt: "2026-01-01" },
    });

    const args = lastCallArgs(mockCreate);
    expect(args.collection).toBe("ba-sessions");
  });

  test("maps 'account' model to 'ba-accounts' collection", async () => {
    await adapter.create({
      model: "account",
      data: {
        userId: "1",
        accountId: "1",
        providerId: "email",
        accessToken: "tok",
      },
    });

    const args = lastCallArgs(mockCreate);
    expect(args.collection).toBe("ba-accounts");
  });

  test("injects a random password for user model", async () => {
    await adapter.create({
      model: "user",
      data: { email: "a@b.com", name: "A" },
    });

    const args = lastCallArgs(mockCreate);
    const data = args.data as Record<string, unknown>;
    expect(typeof data.password).toBe("string");
    expect((data.password as string).length).toBeGreaterThan(0);
  });

  test("generates unique passwords on each create", async () => {
    await adapter.create({
      model: "user",
      data: { email: "a@b.com", name: "A" },
    });
    const pw1 = (lastCallArgs(mockCreate).data as Record<string, unknown>)
      .password;

    await adapter.create({
      model: "user",
      data: { email: "b@b.com", name: "B" },
    });
    const pw2 = (lastCallArgs(mockCreate).data as Record<string, unknown>)
      .password;

    expect(pw1).not.toBe(pw2);
  });

  test("does NOT inject password for non-user models", async () => {
    await adapter.create({
      model: "session",
      data: { token: "abc", userId: "1", expiresAt: "2026-01-01" },
    });

    const args = lastCallArgs(mockCreate);
    const data = args.data as Record<string, unknown>;
    expect(data.password).toBeUndefined();
  });

  test("transforms output — stringifies ID", async () => {
    const result = (await adapter.create({
      model: "user",
      data: { email: "a@b.com", name: "Test" },
    })) as Record<string, unknown>;

    // transformOutput converts id to string
    expect(result.id).toBe("1");
  });

  test("passes data through to payload.create with camelCase keys", async () => {
    await adapter.create({
      model: "user",
      data: { email: "a@b.com", name: "Test" },
    });

    const args = lastCallArgs(mockCreate);
    const data = args.data as Record<string, unknown>;
    // BA sends camelCase keys; our adapter passes them through
    expect(data.email).toBe("a@b.com");
    expect(data).toHaveProperty("createdAt");
    expect(data).toHaveProperty("updatedAt");
  });
});

// -----------------------------------------------------------------------
// findOne
// -----------------------------------------------------------------------
describe("findOne", () => {
  test("calls payload.find with limit 1, depth 0, overrideAccess", async () => {
    await adapter.findOne({
      model: "user",
      where: [
        { field: "email", operator: "eq", value: "a@b.com", connector: "AND" },
      ],
    });

    expect(mockFind).toHaveBeenCalledTimes(1);
    const args = lastCallArgs(mockFind);
    expect(args.limit).toBe(1);
    expect(args.depth).toBe(0);
    expect(args.overrideAccess).toBe(true);
  });

  test("unwraps result.docs[0] and transforms output", async () => {
    const result = (await adapter.findOne({
      model: "user",
      where: [
        { field: "email", operator: "eq", value: "a@b.com", connector: "AND" },
      ],
    })) as Record<string, unknown>;

    expect(result).not.toBeNull();
    expect(result.id).toBe("1");
  });

  test("returns null when no docs found", async () => {
    mockFind.mockImplementationOnce(() =>
      Promise.resolve({ docs: [], totalDocs: 0 })
    );

    const result = await adapter.findOne({
      model: "user",
      where: [
        {
          field: "email",
          operator: "eq",
          value: "no@one.com",
          connector: "AND",
        },
      ],
    });

    expect(result).toBeNull();
  });

  test("maps collection correctly", async () => {
    await adapter.findOne({
      model: "session",
      where: [
        { field: "token", operator: "eq", value: "abc", connector: "AND" },
      ],
    });

    const args = lastCallArgs(mockFind);
    expect(args.collection).toBe("ba-sessions");
  });
});

// -----------------------------------------------------------------------
// findMany
// -----------------------------------------------------------------------
describe("findMany", () => {
  test("calls payload.find and returns array of transformed docs", async () => {
    mockFind.mockImplementationOnce(() =>
      Promise.resolve({
        docs: [
          { id: 1, name: "A" },
          { id: 2, name: "B" },
        ],
        totalDocs: 2,
      })
    );

    const result = (await adapter.findMany({
      model: "user",
      where: [],
    })) as Record<string, unknown>[];

    expect(Array.isArray(result)).toBe(true);
    expect(result).toHaveLength(2);
    // IDs are stringified
    expect(result[0].id).toBe("1");
    expect(result[1].id).toBe("2");
  });

  test("passes sortBy with desc direction as -field", async () => {
    await adapter.findMany({
      model: "user",
      where: [],
      sortBy: { field: "createdAt", direction: "desc" },
    });

    const args = lastCallArgs(mockFind);
    expect(args.sort).toBe("-createdAt");
  });

  test("passes sortBy with asc direction as field", async () => {
    await adapter.findMany({
      model: "user",
      where: [],
      sortBy: { field: "expiresAt", direction: "asc" },
    });

    const args = lastCallArgs(mockFind);
    expect(args.sort).toBe("expiresAt");
  });

  test("defaults limit to 100 when not provided", async () => {
    await adapter.findMany({
      model: "user",
      where: [],
    });

    const args = lastCallArgs(mockFind);
    expect(args.limit).toBe(100);
  });

  test("passes explicit limit through", async () => {
    await adapter.findMany({
      model: "user",
      where: [],
      limit: 10,
    });

    const args = lastCallArgs(mockFind);
    expect(args.limit).toBe(10);
  });

  test("calculates page from offset", async () => {
    await adapter.findMany({
      model: "user",
      where: [],
      limit: 10,
      offset: 20,
    });

    const args = lastCallArgs(mockFind);
    // page = Math.floor(20 / 10) + 1 = 3
    expect(args.page).toBe(3);
  });

  test("page is undefined when no offset", async () => {
    await adapter.findMany({
      model: "user",
      where: [],
    });

    const args = lastCallArgs(mockFind);
    expect(args.page).toBeUndefined();
  });
});

// -----------------------------------------------------------------------
// count
// -----------------------------------------------------------------------
describe("count", () => {
  test("calls payload.count and returns totalDocs", async () => {
    const result = await adapter.count({
      model: "user",
      where: [],
    });

    expect(result).toBe(5);
    expect(mockCount).toHaveBeenCalledTimes(1);
    const args = lastCallArgs(mockCount);
    expect(args.collection).toBe("users");
    expect(args.overrideAccess).toBe(true);
  });
});

// -----------------------------------------------------------------------
// update
// -----------------------------------------------------------------------
describe("update", () => {
  test("calls payload.update with correct params", async () => {
    await adapter.update({
      model: "user",
      where: [{ field: "id", operator: "eq", value: 1, connector: "AND" }],
      update: { name: "Updated" },
    });

    expect(mockUpdate).toHaveBeenCalledTimes(1);
    const args = lastCallArgs(mockUpdate);
    expect(args.collection).toBe("users");
    expect(args.depth).toBe(0);
    expect(args.overrideAccess).toBe(true);
  });

  test("returns transformed doc on success", async () => {
    const result = (await adapter.update({
      model: "user",
      where: [{ field: "id", operator: "eq", value: 1, connector: "AND" }],
      update: { name: "Updated" },
    })) as Record<string, unknown>;

    expect(result).not.toBeNull();
    expect(result.id).toBe("1");
  });

  test("returns null when no docs updated", async () => {
    mockUpdate.mockImplementationOnce(() => Promise.resolve({ docs: [] }));

    const result = await adapter.update({
      model: "user",
      where: [{ field: "id", operator: "eq", value: 999, connector: "AND" }],
      update: { name: "Ghost" },
    });

    expect(result).toBeNull();
  });
});

// -----------------------------------------------------------------------
// updateMany
// -----------------------------------------------------------------------
describe("updateMany", () => {
  test("returns count of updated docs", async () => {
    mockUpdate.mockImplementationOnce(() =>
      Promise.resolve({ docs: [{ id: 1 }, { id: 2 }, { id: 3 }] })
    );

    const result = await adapter.updateMany({
      model: "user",
      where: [{ field: "id", operator: "eq", value: 1, connector: "AND" }],
      update: { name: "Batch" },
    });

    expect(result).toBe(3);
  });
});

// -----------------------------------------------------------------------
// delete
// -----------------------------------------------------------------------
describe("delete", () => {
  test("calls payload.delete with correct collection and params", async () => {
    await adapter.delete({
      model: "user",
      where: [{ field: "id", operator: "eq", value: 1, connector: "AND" }],
    });

    expect(mockDelete).toHaveBeenCalledTimes(1);
    const args = lastCallArgs(mockDelete);
    expect(args.collection).toBe("users");
    expect(args.depth).toBe(0);
    expect(args.overrideAccess).toBe(true);
  });
});

// -----------------------------------------------------------------------
// deleteMany
// -----------------------------------------------------------------------
describe("deleteMany", () => {
  test("returns count of deleted docs", async () => {
    const result = await adapter.deleteMany({
      model: "user",
      where: [{ field: "id", operator: "eq", value: 1, connector: "AND" }],
    });

    // mockDelete returns 2 docs
    expect(result).toBe(2);
  });
});

// -----------------------------------------------------------------------
// Adapter config
// -----------------------------------------------------------------------
describe("adapter config", () => {
  test("adapter has id 'payload'", () => {
    expect(adapter.id).toBe("payload");
  });
});
