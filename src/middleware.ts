import { NextRequest, NextResponse } from "next/server";

// Simple single-user gate: everything requires an "auth" cookie except
// /login, static assets, the PWA manifest/service worker, and the cron endpoint
// (which is protected separately by a secret header).
export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  const isPublic =
    pathname.startsWith("/login") ||
    pathname.startsWith("/api/login") ||
    pathname.startsWith("/api/cron") ||
    pathname.startsWith("/manifest.json") ||
    pathname.startsWith("/sw.js") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/_next");

  if (isPublic) return NextResponse.next();

  const authed = req.cookies.get("planner_auth")?.value === "1";
  if (!authed) {
    const url = req.nextUrl.clone();
    url.pathname = "/login";
    url.searchParams.set("next", pathname);
    return NextResponse.redirect(url);
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
