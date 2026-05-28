// middleware.js
import { NextResponse } from "next/server"

export function middleware(req) {
  return NextResponse.next()
}

export const config = {
  matcher: [
    "/user-dashboard/:path*",
    "/org-dashboard/:path*",
    "/super-admin-dashboard/:path*",
    "/log-in",
    "/sign-up",
  ],
}