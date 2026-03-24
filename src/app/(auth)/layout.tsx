import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { fontVariables } from "@/core/lib/fonts";
import { Providers } from "@/providers/providers";
import "../globals.css";

export default async function AuthLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Redirect authenticated users away from auth pages
  const cookieStore = await cookies();
  const hasPayloadToken = cookieStore.has("payload-token");
  const hasBaSession = cookieStore.has("better-auth.session_token");

  if (hasPayloadToken || hasBaSession) {
    redirect("/admin");
  }

  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${fontVariables} antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
