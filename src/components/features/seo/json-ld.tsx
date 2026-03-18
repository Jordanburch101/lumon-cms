import type { Media, Page, SiteSetting } from "@/payload-types";

interface JsonLdProps {
  page: Page;
  settings: SiteSetting;
}

export function JsonLd({ page, settings }: JsonLdProps) {
  const slug = page.slug === "home" ? "" : page.slug;
  const pageUrl = settings.baseUrl ? `${settings.baseUrl}/${slug}` : undefined;
  const isHome = page.slug === "home";

  const schemas: Record<string, unknown>[] = [];

  // WebPage — every page
  schemas.push({
    "@context": "https://schema.org",
    "@type": "WebPage",
    name: page.meta?.title || page.title,
    ...(page.meta?.description ? { description: page.meta.description } : {}),
    ...(pageUrl ? { url: pageUrl } : {}),
  });

  // Organization — home page only
  if (isHome && settings.jsonLd?.organizationName) {
    const orgLogo = settings.jsonLd.organizationLogo as
      | Media
      | null
      | undefined;
    schemas.push({
      "@context": "https://schema.org",
      "@type": "Organization",
      name: settings.jsonLd.organizationName,
      ...(settings.jsonLd.organizationUrl
        ? { url: settings.jsonLd.organizationUrl }
        : {}),
      ...(orgLogo?.url ? { logo: orgLogo.url } : {}),
    });
  }

  // BreadcrumbList — non-home pages
  if (!isHome && pageUrl && settings.baseUrl) {
    const segments = page.slug.split("/");
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

    schemas.push({
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: items,
    });
  }

  return (
    <>
      {schemas.map((schema) => (
        <script
          // biome-ignore lint/security/noDangerouslySetInnerHtml: intentional JSON-LD injection
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
          key={schema["@type"] as string}
          type="application/ld+json"
        />
      ))}
    </>
  );
}
