// src/components/layout/shared/logo.tsx
import Image from "next/image";
import Link from "next/link";

import { cn } from "@/core/lib/utils";

// --- Types ---

interface LogoData {
  image?:
    | { url?: string | null; alt?: string; width?: number | null; height?: number | null }
    | number
    | null;
  imageHeight?: number | null;
  text?: string | null;
  textAccent?: string | null;
  type?: "text" | "image" | null;
}

interface LogoProps {
  className?: string;
  data: LogoData;
}

// --- Component ---

export function Logo({ data, className }: LogoProps) {
  // Image mode: only when type is "image" and the image field is a populated object with a URL
  if (
    data.type === "image" &&
    data.image !== null &&
    typeof data.image === "object" &&
    data.image.url
  ) {
    const img = data.image;
    const src = img.url as string;
    const displayHeight = data.imageHeight ?? 32;

    // Calculate width from aspect ratio if dimensions are available
    let displayWidth: number | undefined;
    if (img.width && img.height) {
      displayWidth = Math.round((img.width / img.height) * displayHeight);
    }

    return (
      <Image
        alt={img.alt ?? "Logo"}
        className={cn(className)}
        height={displayHeight}
        src={src}
        width={displayWidth ?? displayHeight}
      />
    );
  }

  // Text mode (default)
  const text = data.text ?? "Lumon";
  const accent = data.textAccent ?? "Payload";

  return (
    <Link className={cn("flex items-center", className)} href="/">
      <span className="font-semibold text-base tracking-tight">
        {text}
        {accent && <span className="text-muted-foreground">{accent}</span>}
      </span>
    </Link>
  );
}
