import { NextResponse } from "next/server";

/**
 * Logout route — clears both Payload JWT and Better Auth session cookies,
 * then redirects to /login.
 *
 * This exists because Payload's /admin/logout only clears the JWT cookie,
 * and the (auth) layout redirects authenticated users away from /login,
 * creating a loop if we redirect /admin/logout → /login directly.
 */
export async function GET() {
  const secure = process.env.NODE_ENV === "production" ? "; Secure" : "";
  const response = NextResponse.redirect(
    new URL(
      "/login",
      process.env.NEXT_PUBLIC_SERVER_URL || "http://localhost:3100"
    )
  );

  // Clear Payload JWT
  response.headers.append(
    "Set-Cookie",
    `payload-token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
  );

  // Clear Better Auth session cookies
  response.headers.append(
    "Set-Cookie",
    `better-auth.session_token=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
  );
  response.headers.append(
    "Set-Cookie",
    `better-auth.session_data=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure}`
  );

  return response;
}
