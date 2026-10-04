import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);

export async function proxy(req: NextRequest) {
  const { pathname, searchParams } = req.nextUrl;
  const response = NextResponse.next();

  // 1. Handle ?bypass=true query parameter to set maintenance bypass cookie
  if (searchParams.get("bypass") === "true") {
    response.cookies.set("maintenance_bypass", "true", {
      path: "/",
      maxAge: 86400, // 24 hours
      sameSite: "lax",
    });
  }

  // 2. Handle ?bypass=false or ?bypass=clear to remove maintenance bypass cookie
  if (searchParams.get("bypass") === "false" || searchParams.get("bypass") === "clear") {
    response.cookies.delete("maintenance_bypass");
  }

  // 3. Admin Authentication check for /admin routes
  if (pathname.startsWith("/admin")) {
    const token = req.cookies.get("admin_token")?.value;

    if (!token) {
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }

    try {
      const { payload } = await jwtVerify(token, JWT_SECRET);

      if (!["admin", "support"].includes(payload.role as string)) {
        return NextResponse.redirect(new URL("/admin-login", req.url));
      }
    } catch {
      const redirectResponse = NextResponse.redirect(new URL("/admin-login", req.url));
      redirectResponse.cookies.delete("admin_token");
      redirectResponse.cookies.delete("admin_user");
      return redirectResponse;
    }
  }

  return response;
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
