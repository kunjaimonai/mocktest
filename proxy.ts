import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const SCHOOL_COOKIE = "school_session";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname === "/api/login") {
    return NextResponse.next();
  }

  const hasSchoolCookie = Boolean(request.cookies.get(SCHOOL_COOKIE)?.value);
  if (hasSchoolCookie) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/mocktest")) {
    return NextResponse.json(
      { error: "Unauthorized" },
      {
        status: 401,
        headers: {
          "Cache-Control": "private, no-store, max-age=0",
        },
      }
    );
  }

  const loginUrl = new URL("/auth/login", request.url);
  return NextResponse.redirect(loginUrl);
}

export const config = {
  matcher: ["/mocktest/:path*", "/flow/:path*", "/api/mocktest/:path*", "/api/login"],
};
