import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  
  // 1. Static and Public Paths
  const publicPaths = ["/login", "/api/auth/login", "/api/auth/register"];
  if (publicPaths.some((p) => pathname.startsWith(p))) {
    const token = request.cookies.get("token")?.value;
    if (token && pathname === "/login") {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  // Allow auth routes to proceed
  if (pathname.startsWith("/api/auth")) {
    return NextResponse.next();
  }

  // 2. API routes: authentication is enforced inside every route via enforceAuth(),
  // which validates the JWT cookie or API key and checks scopes. No presence-only
  // check here (that was bypassable with any "Bearer slk_*" header).
  if (pathname.startsWith("/api/")) {
    return NextResponse.next();
  }

  // 3. Page routes: require a token cookie to be present. Pages are client-side shells;
  // the actual data requests are protected by enforceAuth() in the API routes.
  const token = request.cookies.get("token")?.value;
  if (!token) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons.svg).*)",
  ],
};
