import { NextResponse } from "next/server";

import { auth } from "@/lib/auth";

export default auth((req) => {
  const { pathname } = req.nextUrl;
  const session = req.auth;

  const isAdminLogin = pathname === "/admin/login";
  const isAdminRoute = pathname.startsWith("/admin") && !isAdminLogin;
  const isProtectedUserRoute =
    pathname.startsWith("/me") || pathname.startsWith("/account");

  if (isAdminRoute) {
    if (!session) {
      return NextResponse.redirect(new URL("/admin/login", req.url));
    }
    if (session.user.role !== "BUSINESS_ADMIN") {
      return NextResponse.redirect(new URL("/", req.url));
    }
  }

  if (isProtectedUserRoute && !session) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
});

export const config = {
  matcher: ["/admin/:path*", "/me/:path*", "/account/:path*"],
};
