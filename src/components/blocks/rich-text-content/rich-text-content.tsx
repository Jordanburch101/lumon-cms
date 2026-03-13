import { RichText } from "@/components/features/rich-text";
import { cn } from "@/core/lib/utils";
import type { RichTextContentBlock } from "@/types/block-types";

const maxWidthClasses = {
  narrow: "max-w-2xl",
  default: "max-w-4xl",
  wide: "max-w-7xl",
} as const;

type MaxWidth = keyof typeof maxWidthClasses;

export function RichTextContent({
  content,
  maxWidth = "default",
}: RichTextContentBlock) {
  return (
    <section>
      <div
        className={cn(
          "mx-auto px-4 lg:px-6",
          maxWidthClasses[maxWidth as MaxWidth]
        )}
      >
        <RichText data={content} />
      </div>
    </section>
  );
}
