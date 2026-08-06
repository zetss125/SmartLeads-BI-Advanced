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

  // 2. Authentication Presence Check (Real validation happens in the Node.js API routes)
  let isAuthenticated = false;

  const authHeader = request.headers.get("Authorization");
  if (authHeader && authHeader.startsWith("Bearer slk_")) {
    isAuthenticated = true; // API Key detected
  } else {
    const token = request.cookies.get("token")?.value;
    if (token) {
      isAuthenticated = true; // JWT detected
    }
  }

  // 3. Reject obviously unauthenticated requests early
  if (!isAuthenticated) {
    if (pathname.startsWith("/api/")) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 });
    }
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // Rate Limiting and strict Token/Key validation are handled by the Node.js runtime 
  // in individual API routes (since Edge runtime doesn't support 'fs' or 'jsonwebtoken').
  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|icons.svg).*)",
  ],
};
