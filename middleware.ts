import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
    const token = request.cookies.get("admin_token")?.value;

    const pathname = request.nextUrl.pathname;

    if (
        pathname.startsWith("/admin") &&
        !pathname.startsWith("/admin-login") &&
        !token
    ) {
        return NextResponse.redirect(new URL("/admin-login", request.url));
    }

    if (pathname.startsWith("/admin-login") && token) {
        return NextResponse.redirect(new URL("/admin", request.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ["/admin/:path*", "/admin-login"],
};
