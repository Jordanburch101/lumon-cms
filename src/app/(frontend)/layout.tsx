import type { Metadata } from "next";
import { Geist_Mono, Nunito_Sans } from "next/font/google";
import { Suspense } from "react";
import { AdminBar } from "@/components/features/admin-bar/admin-bar";
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

export const metadata: Metadata = {
  title: "Lumon",
  description: "Next.js + Payload CMS template and component showcase",
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
          <Footer />
          <Suspense>
            <AdminBar />
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
