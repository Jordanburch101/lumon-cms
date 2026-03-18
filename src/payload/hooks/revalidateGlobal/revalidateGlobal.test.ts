import { beforeEach, describe, expect, it, mock } from "bun:test";

const revalidatedTags: Array<{ tag: string; profile: string }> = [];
const loggedInfo: unknown[] = [];
const loggedErrors: unknown[] = [];

mock.module("next/cache", () => ({
  revalidateTag: (tag: string, profile: string) => {
    revalidatedTags.push({ tag, profile });
  },
  // Stub other next/cache exports so co-loaded modules don't break
  cacheTag: (..._tags: string[]) => {
    // intentional no-op stub
  },
  cacheLife: (_profile: string) => {
    // intentional no-op stub
  },
}));

const { revalidateGlobalOnChange } = await import(".");

/** Minimal stub matching what the hook destructures */
function makeHookArgs(
  overrides: {
    globalSlug?: string;
    disableRevalidate?: boolean;
    throwOnRevalidate?: boolean;
  } = {}
) {
  return {
    global: { slug: overrides.globalSlug ?? "site-settings" },
    req: {
      payload: {
        logger: {
          info: (obj: unknown) => {
            loggedInfo.push(obj);
          },
          error: (obj: unknown) => {
            loggedErrors.push(obj);
          },
        },
      },
      context: {
        disableRevalidate: overrides.disableRevalidate ?? false,
      },
    },
  } as unknown as Parameters<ReturnType<typeof revalidateGlobalOnChange>>[0];
}

describe("revalidateGlobalOnChange", () => {
  beforeEach(() => {
    revalidatedTags.length = 0;
    loggedInfo.length = 0;
    loggedErrors.length = 0;
  });

  it("revalidates all provided tags", () => {
    const hook = revalidateGlobalOnChange(["nav", "footer", "site-settings"]);
    hook(makeHookArgs({ globalSlug: "site-settings" }));

    expect(revalidatedTags).toEqual([
      { tag: "nav", profile: "default" },
      { tag: "footer", profile: "default" },
      { tag: "site-settings", profile: "default" },
    ]);
  });

  it("skips revalidation when disableRevalidate is true", () => {
    const hook = revalidateGlobalOnChange(["nav", "footer"]);
    hook(makeHookArgs({ disableRevalidate: true }));

    expect(revalidatedTags).toHaveLength(0);
  });

  it("logs success message with global slug", () => {
    const hook = revalidateGlobalOnChange(["nav"]);
    hook(makeHookArgs({ globalSlug: "site-settings" }));

    expect(loggedInfo).toHaveLength(1);
    expect(loggedInfo[0]).toEqual({ msg: "Revalidated global:site-settings" });
  });

  it("handles errors gracefully without throwing", () => {
    // Replace revalidateTag with a throwing version for this test
    // We test via a hook arg whose logger.error we can capture
    // Simulate error by using an empty tags array — no throw possible
    // Instead verify error path by using a spy logger
    const errors: unknown[] = [];
    const args = {
      global: { slug: "broken-global" },
      req: {
        payload: {
          logger: {
            info: (_obj: unknown) => {
              throw new Error("Forced failure");
            },
            error: (obj: unknown) => {
              errors.push(obj);
            },
          },
        },
        context: { disableRevalidate: false },
      },
    } as unknown as Parameters<ReturnType<typeof revalidateGlobalOnChange>>[0];

    const hook = revalidateGlobalOnChange(["some-tag"]);

    // Should not throw
    expect(() => hook(args)).not.toThrow();
    expect(errors).toHaveLength(1);
    expect(errors[0]).toMatchObject({
      msg: "Cache revalidation failed for global:broken-global",
    });
  });

  it("revalidates a single tag correctly", () => {
    const hook = revalidateGlobalOnChange(["only-tag"]);
    hook(makeHookArgs({ globalSlug: "some-global" }));

    expect(revalidatedTags).toEqual([{ tag: "only-tag", profile: "default" }]);
  });

  it("does not revalidate when tag list is empty", () => {
    const hook = revalidateGlobalOnChange([]);
    hook(makeHookArgs({ globalSlug: "site-settings" }));

    expect(revalidatedTags).toHaveLength(0);
    // Still logs success even with empty tags
    expect(loggedInfo).toHaveLength(1);
  });
});
