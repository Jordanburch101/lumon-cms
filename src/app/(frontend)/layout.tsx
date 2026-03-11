import { Footer } from "@/components/layout/footer/footer";
import { Navbar } from "@/components/layout/navbar/navbar";
import { Providers } from "@/providers/providers";

export default function FrontendLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <Providers>
      {process.env.NODE_ENV === "development" && (
        <script
          async
          src="https://mcp.figma.com/mcp/html-to-design/capture.js"
        />
      )}
      <Navbar />
      <main>{children}</main>
      <Footer />
    </Providers>
  );
}
