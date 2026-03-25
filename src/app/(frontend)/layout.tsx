import type { Metadata } from "next";
import { Suspense } from "react";
import { AdminBar } from "@/components/features/admin-bar/admin-bar";
import { EditableOverlay } from "@/components/features/frontend-editor/editable-overlay";
import { Footer } from "@/components/layout/footer/footer";
import { Navbar } from "@/components/layout/navbar/navbar";
import { fontVariables } from "@/core/lib/fonts";
import { getCachedFooter, getCachedHeader } from "@/payload/lib/cached-payload";
import { Providers } from "@/providers/providers";
import "../globals.css";

// Static export — cannot fetch SiteSettings dynamically.
// Update "Lumon" if the site name changes in SiteSettings.
export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Lumon",
  },
};

async function NavbarLoader() {
  const data = await getCachedHeader();
  return <Navbar data={data} />;
}

async function FooterLoader() {
  const data = await getCachedFooter();
  return <Footer data={data} />;
}

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVariables} antialiased`}>
        <Providers>
          {process.env.NODE_ENV === "development" && (
            <script
              async
              src="https://mcp.figma.com/mcp/html-to-design/capture.js"
            />
          )}
          <Suspense>
            <NavbarLoader />
          </Suspense>
          <Suspense>
            <main>{children}</main>
          </Suspense>
          <EditableOverlay />
          <Suspense>
            <AdminBar />
          </Suspense>
          <Suspense>
            <FooterLoader />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
