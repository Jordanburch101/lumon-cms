import { type NextRequest, NextResponse } from "next/server";

const ONE_YEAR = 60 * 60 * 24 * 365;
const VIDEO_RE = /\.(mp4|webm|mov)$/i;

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Aggressive caching for video files served through Payload's media route
  if (pathname.startsWith("/api/media/file/") && VIDEO_RE.test(pathname)) {
    const response = NextResponse.next();
    response.headers.set(
      "Cache-Control",
      `public, max-age=${ONE_YEAR}, immutable`
    );
    return response;
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/api/media/file/:path*"],
};
