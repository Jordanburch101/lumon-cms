import { TRAILING_SLASH_RE } from "@/core/lib/utils";
import type { Page, SiteSetting } from "@/payload-types";

const ABSOLUTE_URL_RE = /^https?:\/\//;

function resolveAbsoluteUrl(url: string, baseUrl: string | undefined): string {
  if (ABSOLUTE_URL_RE.test(url)) {
    return url;
  }
  return baseUrl ? `${baseUrl}${url}` : url;
}

interface JsonLdProps {
  page: Page;
  settings: SiteSetting;
}

export function JsonLd({ page, settings }: JsonLdProps) {
  const pagePath = page.path ?? page.slug;
  const urlPath = !pagePath || pagePath === "" ? "" : pagePath;
  const pageUrl = settings.baseUrl
    ? `${settings.baseUrl}/${urlPath}`.replace(TRAILING_SLASH_RE, "")
    : undefined;
  const isHome = !pagePath || pagePath === "";

  const graph: Record<string, unknown>[] = [];

  // WebPage — every page
  graph.push({
    "@type": "WebPage",
    name: page.meta?.title || page.title,
    ...(page.meta?.description ? { description: page.meta.description } : {}),
    ...(pageUrl ? { url: pageUrl } : {}),
  });

  // Organization — home page only
  if (isHome && settings.jsonLd?.organizationName) {
    // Guard against unpopulated media (raw number ID) and ensure absolute URL
    const rawLogo = settings.jsonLd.organizationLogo;
    const logoUrl =
      rawLogo && typeof rawLogo !== "number" && rawLogo.url
        ? resolveAbsoluteUrl(rawLogo.url, settings.baseUrl || undefined)
        : undefined;
    graph.push({
      "@type": "Organization",
      name: settings.jsonLd.organizationName,
      ...(settings.jsonLd.organizationUrl
        ? { url: settings.jsonLd.organizationUrl }
        : {}),
      ...(logoUrl ? { logo: logoUrl } : {}),
    });
  }

  // BreadcrumbList — non-home pages
  // Note: intermediate breadcrumb segments link to {baseUrl}/{segment} which
  // may not be a real page. This is acceptable for flat-slug pages; revisit
  // if nested slug routing is introduced.
  if (!isHome && pageUrl && settings.baseUrl) {
    const segments = urlPath.split("/");
    const items = [
      {
        "@type": "ListItem",
        position: 1,
        name: "Home",
        item: settings.baseUrl,
      },
      ...segments.map((segment, i) => ({
        "@type": "ListItem",
        position: i + 2,
        name: segment
          .replace(/-/g, " ")
          .replace(/\b\w/g, (c) => c.toUpperCase()),
        item: `${settings.baseUrl}/${segments.slice(0, i + 1).join("/")}`,
      })),
    ];

    graph.push({
      "@type": "BreadcrumbList",
      itemListElement: items,
    });
  }

  const jsonLd = { "@context": "https://schema.org", "@graph": graph };

  return (
    <script
      // biome-ignore lint/security/noDangerouslySetInnerHtml: JSON.stringify escapes all special chars
      dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      type="application/ld+json"
    />
  );
}
