import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { Suspense } from "react";
import { fontVariables } from "@/core/lib/fonts";
import { Providers } from "@/providers/providers";
import "../globals.css";

async function AuthGuard({ children }: { children: React.ReactNode }) {
  const cookieStore = await cookies();
  const hasPayloadToken = cookieStore.has("payload-token");
  const hasBaSession = cookieStore.has("better-auth.session_token");

  if (hasPayloadToken || hasBaSession) {
    redirect("/admin");
  }

  return <>{children}</>;
}

export default function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVariables} antialiased`}>
        <Providers>
          <Suspense>
            <AuthGuard>{children}</AuthGuard>
          </Suspense>
        </Providers>
      </body>
    </html>
  );
}
