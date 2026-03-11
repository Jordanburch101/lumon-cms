import { beforeEach, describe, expect, it, mock } from "bun:test";

// Mock sharp — returns a chainable pipeline that resolves to a buffer
const mockToBuffer = mock(() => Promise.resolve(Buffer.from("fake-webp")));
const mockPipeline = {
  resize: mock(() => mockPipeline),
  blur: mock(() => mockPipeline),
  webp: mock(() => mockPipeline),
  toBuffer: mockToBuffer,
};
mock.module("sharp", () => ({
  default: mock(() => mockPipeline),
}));

const { generateBlurDataURL } = await import(".");

/** Minimal stub for Payload BeforeChangeHook args */
function makeArgs(
  overrides: {
    operation?: "create" | "update";
    mimeType?: string;
    fileData?: Buffer | null;
    existingBlur?: string;
  } = {}
) {
  const data: Record<string, unknown> = {
    mimeType: overrides.mimeType ?? "image/jpeg",
    blurDataURL: overrides.existingBlur,
  };
  return {
    data,
    operation: overrides.operation ?? "create",
    req: {
      file:
        overrides.fileData !== null
          ? {
              data: overrides.fileData ?? Buffer.from("fake-image"),
              mimetype: overrides.mimeType ?? "image/jpeg",
            }
          : undefined,
      payload: {
        logger: {
          error: () => {
            // intentional no-op stub
          },
        },
      },
    },
  } as unknown as Parameters<typeof generateBlurDataURL>[0];
}

describe("generateBlurDataURL", () => {
  beforeEach(() => {
    mockToBuffer.mockClear();
    mockPipeline.resize.mockClear();
    mockPipeline.blur.mockClear();
    mockPipeline.webp.mockClear();
  });

  it("generates a blur data URL on create with image file", async () => {
    const args = makeArgs();
    const result = await generateBlurDataURL(args);

    expect(mockPipeline.resize).toHaveBeenCalledWith(16);
    expect(mockPipeline.blur).toHaveBeenCalledWith(10);
    expect(mockPipeline.webp).toHaveBeenCalledWith({ quality: 20 });
    expect(result.blurDataURL).toStartWith("data:image/webp;base64,");
  });

  it("skips update operations without a new file", async () => {
    const args = makeArgs({ operation: "update", fileData: null });
    const result = await generateBlurDataURL(args);

    expect(mockToBuffer).not.toHaveBeenCalled();
    expect(result.blurDataURL).toBeUndefined();
  });

  it("processes update operations WITH a new file", async () => {
    const args = makeArgs({ operation: "update" });
    const result = await generateBlurDataURL(args);

    expect(mockToBuffer).toHaveBeenCalled();
    expect(result.blurDataURL).toStartWith("data:image/webp;base64,");
  });

  it("skips non-image mimetypes", async () => {
    const args = makeArgs({ mimeType: "video/mp4" });
    const result = await generateBlurDataURL(args);

    expect(mockToBuffer).not.toHaveBeenCalled();
    expect(result.blurDataURL).toBeUndefined();
  });

  it("skips SVG images", async () => {
    const args = makeArgs({ mimeType: "image/svg+xml" });
    const result = await generateBlurDataURL(args);

    expect(mockToBuffer).not.toHaveBeenCalled();
    expect(result.blurDataURL).toBeUndefined();
  });

  it("clears stale blur on re-upload before regenerating", async () => {
    const args = makeArgs({
      operation: "update",
      existingBlur: "data:image/webp;base64,old-data",
    });

    // After the clear but before sharp runs, blurDataURL should be undefined
    const result = await generateBlurDataURL(args);

    // Final result has new blur (sharp succeeded)
    expect(result.blurDataURL).toStartWith("data:image/webp;base64,");
    expect(result.blurDataURL).not.toBe("data:image/webp;base64,old-data");
  });

  it("returns data unchanged when no buffer is available", async () => {
    // Create with file but file.data is undefined
    const args = makeArgs();
    (args.req as unknown as Record<string, unknown>).file = { mimetype: "image/jpeg" };
    const result = await generateBlurDataURL(args);

    expect(mockToBuffer).not.toHaveBeenCalled();
    expect(result.blurDataURL).toBeUndefined();
  });

  it("handles sharp errors gracefully", async () => {
    mockToBuffer.mockRejectedValueOnce(new Error("sharp failed"));

    const args = makeArgs();
    const result = await generateBlurDataURL(args);

    // Should not throw, returns data without blurDataURL
    expect(result).toBeDefined();
  });
});
