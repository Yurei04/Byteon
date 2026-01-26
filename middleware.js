import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req) {
  const res = NextResponse.next()

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) =>
          res.cookies.set({ name, value, ...options }),
        remove: (name, options) =>
          res.cookies.set({ name, value: "", ...options }),
      },
    }
  )

  const {
    data: { session },
  } = await supabase.auth.getSession()

  const pathname = req.nextUrl.pathname

  // Not logged in
  if (!session) {
    if (
      pathname.startsWith("/user-dashboard") ||
      pathname.startsWith("/org-dashboard")
    ) {
      return NextResponse.redirect(new URL("/log-in", req.url))
    }
    return res
  }

  const userId = session.user.id

  // Check role tables
  const { data: userProfile } = await supabase
    .from("users")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  const { data: orgProfile } = await supabase
    .from("organizations")
    .select("id")
    .eq("user_id", userId)
    .maybeSingle()

  const isUser = !!userProfile
  const isOrg = !!orgProfile

  // Wrong dashboard access
  if (pathname.startsWith("/user-dashboard") && !isUser) {
    return NextResponse.redirect(new URL("/org-dashboard", req.url))
  }

  if (pathname.startsWith("/org-dashboard") && !isOrg) {
    return NextResponse.redirect(new URL("/user-dashboard", req.url))
  }

  // Prevent logged-in users from login/signup
  if (pathname === "/log-in" || pathname === "/sign-up") {
    return NextResponse.redirect(
      new URL(isOrg ? "/org-dashboard" : "/user-dashboard", req.url)
    )
  }

  return res
}

export const config = {
  matcher: [
    "/user-dashboard/:path*",
    "/org-dashboard/:path*",
    "/log-in",
    "/sign-up",
  ],
}
