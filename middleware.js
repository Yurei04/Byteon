import { NextResponse } from "next/server"

export async function middleware(req) {
  const res = NextResponse.next();
  const supabase = createMiddlewareClient({req, res})

  const {
    data: {session},
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname;

  if (!sessiom && pathname === "/user-dashboard") { // if not session redirect to login
    return NextResponse.redirect(new URL("/log-in", req.url))
  }

  if (session && (pathname === "/log-in" || pathname === "/sign-up")) { //if success redirect to dashbpard
    return NextResponse.redirect(new URL("/user-dashboard", req.url))
  }
  return res
}

export const config = {
  matcher: ["/dashboard/:path*", "/log-in", "/sign-up"]
}