import { cn } from "@/core/lib/utils";

const TRUSTED_DOMAINS = [
  "youtube.com",
  "www.youtube.com",
  "youtu.be",
  "vimeo.com",
  "player.vimeo.com",
  "x.com",
  "twitter.com",
  "codepen.io",
  "codesandbox.io",
];

const WWW_PREFIX = /^www\./;

const aspectClasses = {
  "16:9": "aspect-video",
  "4:3": "aspect-4/3",
  "1:1": "aspect-square",
} as const;

const maxWidthClasses = {
  full: "max-w-full",
  large: "max-w-4xl",
  medium: "max-w-2xl",
} as const;

type AspectRatio = keyof typeof aspectClasses;
type MaxWidth = keyof typeof maxWidthClasses;

function getEmbedUrl(url: string): string | null {
  try {
    const parsed = new URL(url);

    if (!TRUSTED_DOMAINS.some((d) => parsed.hostname === d)) {
      return null;
    }

    const domain = parsed.hostname.replace(WWW_PREFIX, "");

    if (domain === "youtube.com" && parsed.searchParams.get("v")) {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v")}`;
    }
    if (domain === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    if (domain === "vimeo.com") {
      return `https://player.vimeo.com/video${parsed.pathname}`;
    }

    return url;
  } catch {
    return null;
  }
}

export function EmbedConverter({
  node,
}: {
  node: {
    fields: {
      url: string;
      aspectRatio?: AspectRatio;
      maxWidth?: MaxWidth;
    };
  };
}) {
  const { url, aspectRatio = "16:9", maxWidth = "large" } = node.fields;
  const embedUrl = getEmbedUrl(url);

  if (!embedUrl) {
    return (
      <div className="not-prose my-6 rounded-md border border-border p-4 text-center text-muted-foreground text-sm">
        Embed unavailable: URL not from a trusted provider.
      </div>
    );
  }

  return (
    <div className={cn("not-prose mx-auto my-8", maxWidthClasses[maxWidth])}>
      <div
        className={cn("overflow-hidden rounded-lg", aspectClasses[aspectRatio])}
      >
        <iframe
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          allowFullScreen
          className="h-full w-full"
          sandbox="allow-scripts allow-same-origin allow-popups"
          src={embedUrl}
          title="Embedded content"
        />
      </div>
    </div>
  );
}
