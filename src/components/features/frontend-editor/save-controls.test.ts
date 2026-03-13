import { describe, expect, it, mock } from "bun:test";

describe("save flow logic", () => {
  it("constructs correct PATCH body for draft save", async () => {
    const mockFetch = mock(() =>
      Promise.resolve({ ok: true, json: () => Promise.resolve({ layout: [] }) })
    );
    globalThis.fetch = mockFetch as any;

    const pageId = 1;
    const blocks = [{ id: "a", blockType: "hero", headline: "Test" }];
    await fetch(`/api/pages/${pageId}`, {
      method: "PATCH",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ layout: blocks, _status: "draft" }),
    });

    expect(mockFetch).toHaveBeenCalledTimes(1);
    const call = (
      mockFetch.mock.calls as unknown as [string, RequestInit][]
    )[0];
    expect(call[0]).toBe("/api/pages/1");
    const body = JSON.parse((call[1] as RequestInit).body as string);
    expect(body._status).toBe("draft");
    expect(body.layout[0].blockType).toBe("hero");
  });

  it("handles 401 session expiry", async () => {
    const mockFetch = mock(() =>
      Promise.resolve({
        ok: false,
        status: 401,
        json: () => Promise.resolve({}),
      })
    );
    globalThis.fetch = mockFetch as any;

    const res = await fetch("/api/pages/1", { method: "PATCH" });
    expect(res.ok).toBe(false);
    expect(res.status).toBe(401);
  });
});
