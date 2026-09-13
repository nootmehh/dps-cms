import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  // Domain redirect: forward legacy Netlify subdomain to custom domain
  const host = request.headers.get("x-forwarded-host") || request.headers.get("host") || "";
  if (host === "dps-cms.netlify.app") {
    const redirectUrl = new URL(
      request.nextUrl.pathname + request.nextUrl.search,
      "https://cms.dpsmarkajalan.com"
    );
    return NextResponse.redirect(redirectUrl, 301);
  }

  const { pathname } = request.nextUrl;

  // Public paths: root login page (/), next assets, static files, uploads, favicon
  if (
    pathname === "/" ||
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") ||
    pathname.startsWith("/icons") ||
    pathname.startsWith("/lord-icons") ||
    pathname.startsWith("/uploads") ||
    pathname.includes(".")
  ) {
    return NextResponse.next();
  }

  // Check auth cookie
  const authCookie = request.cookies.get("dps_cms_auth");
  if (!authCookie || !authCookie.value) {
    const loginUrl = new URL("/", request.url);
    loginUrl.searchParams.set("login_required", "1");
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files
     */
    "/((?!api|_next/static|_next/image|favicon.ico).*)",
  ],
};
