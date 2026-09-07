import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;
  const isScanRoute = pathname.endsWith("/scan") && pathname.startsWith("/businesses/");
  const isProtectedUserRoute =
    pathname.startsWith("/me") || pathname.startsWith("/account") || isScanRoute;

  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (session.user.role !== "BUSINESS_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isProtectedUserRoute && !session) {
    const loginUrl = new URL("/login", req.url);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }
});

export const config = {
  matcher: ["/admin/:path*", "/me/:path*", "/account/:path*", "/businesses/:path*/scan"],
};
