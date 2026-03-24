/**
 * Tests for the Better Auth strategy that bridges BA sessions into Payload.
 *
 * The strategy lazy-imports `./server` for `auth.api.getSession`. We mock
 * that module so no real BA instance is needed.
 */
import { beforeEach, describe, expect, mock, test } from "bun:test";

// ---- Mock ./server (Better Auth instance) ----------------------------

const mockGetSession = mock(() =>
  Promise.resolve({
    user: { id: "1", email: "test@test.com", name: "Test User" },
    session: { token: "tok", userId: "1" },
  })
);

mock.module("./server", () => ({
  auth: {
    api: {
      getSession: mockGetSession,
    },
  },
}));

// ---- Import strategy after mocks ------------------------------------

const { betterAuthStrategy } = await import("./strategy");

// ---- Helpers --------------------------------------------------------

const mockFindByID = mock(() =>
  Promise.resolve({
    id: 1,
    email: "test@test.com",
    name: "Test User",
    role: "admin",
  })
);

function makeMockPayload() {
  return { findByID: mockFindByID } as never;
}

function makeHeaders(cookie?: string): Headers {
  const headers = new Headers();
  if (cookie) {
    headers.set("cookie", cookie);
  }
  return headers;
}

// ---- Tests ----------------------------------------------------------

beforeEach(() => {
  mockGetSession.mockClear();
  mockFindByID.mockClear();

  // Restore default implementations after any per-test overrides
  mockGetSession.mockImplementation(() =>
    Promise.resolve({
      user: { id: "1", email: "test@test.com", name: "Test User" },
      session: { token: "tok", userId: "1" },
    })
  );

  mockFindByID.mockImplementation(() =>
    Promise.resolve({
      id: 1,
      email: "test@test.com",
      name: "Test User",
      role: "admin",
    })
  );
});

describe("betterAuthStrategy", () => {
  test("has name 'better-auth'", () => {
    expect(betterAuthStrategy.name).toBe("better-auth");
  });

  test("returns { user: null } when no cookie header", async () => {
    const result = await betterAuthStrategy.authenticate({
      payload: makeMockPayload(),
      headers: makeHeaders(),
    } as never);

    expect(result).toEqual({ user: null });
    // Should not call getSession at all
    expect(mockGetSession).not.toHaveBeenCalled();
  });

  test("returns { user: null } when cookie exists but no BA session token", async () => {
    const result = await betterAuthStrategy.authenticate({
      payload: makeMockPayload(),
      headers: makeHeaders("some_other_cookie=abc"),
    } as never);

    expect(result).toEqual({ user: null });
    expect(mockGetSession).not.toHaveBeenCalled();
  });

  test("returns { user: null } when getSession returns null", async () => {
    mockGetSession.mockImplementationOnce(() => Promise.resolve(null));

    const result = await betterAuthStrategy.authenticate({
      payload: makeMockPayload(),
      headers: makeHeaders("better-auth.session_token=abc123"),
    } as never);

    expect(result).toEqual({ user: null });
    expect(mockGetSession).toHaveBeenCalledTimes(1);
    // Should not proceed to findByID
    expect(mockFindByID).not.toHaveBeenCalled();
  });

  test("returns { user: null } when getSession returns user without id", async () => {
    mockGetSession.mockImplementationOnce(() =>
      Promise.resolve({
        user: { email: "test@test.com" }, // no id
        session: {},
      })
    );

    const result = await betterAuthStrategy.authenticate({
      payload: makeMockPayload(),
      headers: makeHeaders("better-auth.session_token=abc123"),
    } as never);

    expect(result).toEqual({ user: null });
    expect(mockFindByID).not.toHaveBeenCalled();
  });

  test("returns { user: null } when Payload findByID returns null", async () => {
    mockFindByID.mockImplementationOnce(() => Promise.resolve(null));

    const result = await betterAuthStrategy.authenticate({
      payload: makeMockPayload(),
      headers: makeHeaders("better-auth.session_token=abc123"),
    } as never);

    expect(result).toEqual({ user: null });
    expect(mockFindByID).toHaveBeenCalledTimes(1);
  });

  test("returns user with collection on success", async () => {
    const result = await betterAuthStrategy.authenticate({
      payload: makeMockPayload(),
      headers: makeHeaders("better-auth.session_token=abc123"),
    } as never);

    expect(result).toEqual({
      user: {
        collection: "users",
        id: 1,
        email: "test@test.com",
        name: "Test User",
        role: "admin",
      },
    });
  });

  test("includes collection: 'users' in successful result", async () => {
    const result = await betterAuthStrategy.authenticate({
      payload: makeMockPayload(),
      headers: makeHeaders("better-auth.session_token=abc123"),
    } as never);

    const user = (result as { user: Record<string, unknown> }).user;
    expect(user.collection).toBe("users");
  });

  test("converts user ID from string to number for findByID", async () => {
    mockGetSession.mockImplementationOnce(() =>
      Promise.resolve({
        user: { id: "42", email: "test@test.com" },
        session: {},
      })
    );

    await betterAuthStrategy.authenticate({
      payload: makeMockPayload(),
      headers: makeHeaders("better-auth.session_token=abc123"),
    } as never);

    expect(mockFindByID).toHaveBeenCalledTimes(1);
    const args = mockFindByID.mock.calls[0][0] as Record<string, unknown>;
    expect(args.id).toBe(42);
    expect(args.collection).toBe("users");
    expect(args.depth).toBe(0);
  });

  test("returns { user: null } when getSession throws (graceful fallthrough)", async () => {
    mockGetSession.mockImplementationOnce(() =>
      Promise.reject(new Error("BA exploded"))
    );

    const result = await betterAuthStrategy.authenticate({
      payload: makeMockPayload(),
      headers: makeHeaders("better-auth.session_token=abc123"),
    } as never);

    expect(result).toEqual({ user: null });
  });

  test("returns { user: null } when findByID throws", async () => {
    mockFindByID.mockImplementationOnce(() =>
      Promise.reject(new Error("DB error"))
    );

    const result = await betterAuthStrategy.authenticate({
      payload: makeMockPayload(),
      headers: makeHeaders("better-auth.session_token=abc123"),
    } as never);

    expect(result).toEqual({ user: null });
  });

  test("passes headers through to getSession", async () => {
    const headers = makeHeaders("better-auth.session_token=abc123; other=val");

    await betterAuthStrategy.authenticate({
      payload: makeMockPayload(),
      headers,
    } as never);

    expect(mockGetSession).toHaveBeenCalledTimes(1);
    const callArgs = mockGetSession.mock.calls[0][0] as { headers: Headers };
    expect(callArgs.headers).toBe(headers);
  });
});
