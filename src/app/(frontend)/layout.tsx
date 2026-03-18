import type { Metadata } from "next";
import { Geist_Mono, Nunito_Sans } from "next/font/google";
import { Suspense } from "react";
import { AdminBar } from "@/components/features/admin-bar/admin-bar";
import { EditableOverlay } from "@/components/features/frontend-editor/editable-overlay";
import { Footer } from "@/components/layout/footer/footer";
import { Navbar } from "@/components/layout/navbar/navbar";
import { Providers } from "@/providers/providers";
import "../globals.css";

const nunitoSans = Nunito_Sans({
  variable: "--font-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Static export — cannot fetch SiteSettings dynamically.
// Update "Lumon" if the site name changes in SiteSettings.
export const metadata: Metadata = {
  title: {
    template: "%s",
    default: "Lumon",
  },
};

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${nunitoSans.variable} ${geistMono.variable} antialiased`}
      >
        <Providers>
          {process.env.NODE_ENV === "development" && (
            <script
              async
              src="https://mcp.figma.com/mcp/html-to-design/capture.js"
            />
          )}
          <Navbar />
          <Suspense>
            <main>{children}</main>
          </Suspense>
          <EditableOverlay />
          <Suspense>
            <AdminBar />
          </Suspense>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}
