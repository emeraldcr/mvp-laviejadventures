import { NextRequest, NextResponse } from "next/server";
import { getOperatorFromRequest } from "./lib/b2b-auth";

const PUBLIC_B2B_PATHS = ["/b2b/login", "/b2b/register"];

export function middleware(req: NextRequest) {
  const { pathname } = req.nextUrl;

  // Protect B2B routes
  if (pathname.startsWith("/b2b")) {
    if (!PUBLIC_B2B_PATHS.some((p) => pathname === p || pathname.startsWith(p + "?"))) {
      const operator = getOperatorFromRequest(req);

      if (!operator) {
        const loginUrl = new URL("/b2b/login", req.url);
        loginUrl.searchParams.set("from", pathname);
        return NextResponse.redirect(loginUrl);
      }

      if (operator.status === "pending") {
        return NextResponse.redirect(new URL("/b2b/pending", req.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/b2b/:path*"],
};
