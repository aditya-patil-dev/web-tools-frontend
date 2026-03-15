import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_ACCESS_SECRET);

export async function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;

  if (!pathname.startsWith("/admin")) {
    return NextResponse.next();
  }

  const token = req.cookies.get("admin_token")?.value;

  if (!token) {
    return NextResponse.redirect(new URL("/admin-login", req.url));
  }

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET);

    if (!["admin", "support"].includes(payload.role as string)) {
      return NextResponse.redirect(new URL("/admin-login", req.url));
    }

    return NextResponse.next();
  } catch {
    const response = NextResponse.redirect(new URL("/admin-login", req.url));
    response.cookies.delete("admin_token");
    response.cookies.delete("admin_user");
    return response;
  }
}

export const config = {
  matcher: ["/admin/:path*"],
};
