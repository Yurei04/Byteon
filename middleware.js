import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req) {
  const res      = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // ── Never intercept the suspended page — infinite redirect guard ──────────
  if (pathname.startsWith("/account-suspended")) return res

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get:    (name)                => req.cookies.get(name)?.value,
        set:    (name, value, options) => res.cookies.set({ name, value, ...options }),
        remove: (name, options)        => res.cookies.set({ name, value: "", ...options }),
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!session) {
    if (
      pathname.startsWith("/user-dashboard") ||
      pathname.startsWith("/org-dashboard")  ||
      pathname.startsWith("/super-admin-dashboard")
    ) {
      return NextResponse.redirect(new URL("/log-in", req.url))
    }
    return res
  }

  const userId          = session.user.id
  const isAddingAccount = req.nextUrl.searchParams.get("add") === "true"

  // ── Fetch role tables in parallel ─────────────────────────────────────────
  const [
    { data: superProfile },
    { data: userProfile  },
    { data: orgProfile   },
  ] = await Promise.all([
    supabase.from("super_admins")  .select("id").eq("user_id", userId).maybeSingle(),
    supabase.from("users")         .select("id, active").eq("user_id", userId).maybeSingle(),
    supabase.from("organizations") .select("id, active").eq("user_id", userId).maybeSingle(),
  ])

  const isSuperAdmin = !!superProfile
  const isUser       = !!userProfile
  const isOrg        = !!orgProfile

  // ── Super admins bypass ALL suspension / deletion checks ──────────────────
  if (isSuperAdmin) {
    // Allow through if adding another account
    if ((pathname === "/log-in" || pathname === "/sign-up") && isAddingAccount) {
      return res
    }
    // Block super admin from hitting login/signup
    if (pathname === "/log-in" || pathname === "/sign-up") {
      return NextResponse.redirect(new URL("/super-admin-dashboard", req.url))
    }
    // Block super admin from wrong dashboards
    if (pathname.startsWith("/user-dashboard")) {
      return NextResponse.redirect(new URL("/super-admin-dashboard", req.url))
    }
    if (pathname.startsWith("/org-dashboard")) {
      return NextResponse.redirect(new URL("/super-admin-dashboard", req.url))
    }
    return res
  }

  // ── From here on: non-super-admin users only ──────────────────────────────

  // Account deleted — session exists but no profile row in any table
  if (!isUser && !isOrg) {
    const url = new URL("/account-suspended", req.url)
    url.searchParams.set("reason", "deleted")
    return NextResponse.redirect(url)
  }

  // Account suspended — active === false
  if (isUser && userProfile.active === false) {
    let detail = null
    try {
      const { data } = await supabase
        .from("users")
        .select("suspension_reason")
        .eq("id", userProfile.id)
        .maybeSingle()
      detail = data?.suspension_reason ?? null
    } catch {}

    const url = new URL("/account-suspended", req.url)
    url.searchParams.set("reason", "suspended")
    if (detail) url.searchParams.set("detail", detail)
    return NextResponse.redirect(url)
  }

  if (isOrg && orgProfile.active === false) {
    let detail = null
    try {
      const { data } = await supabase
        .from("organizations")
        .select("suspension_reason")
        .eq("id", orgProfile.id)
        .maybeSingle()
      detail = data?.suspension_reason ?? null
    } catch {}

    const url = new URL("/account-suspended", req.url)
    url.searchParams.set("reason", "suspended")
    if (detail) url.searchParams.set("detail", detail)
    return NextResponse.redirect(url)
  }

  // ── Prevent logged-in users from hitting login/signup ─────────────────────
  if (pathname === "/log-in" || pathname === "/sign-up") {
    if (!isAddingAccount) {
      if (isOrg)  return NextResponse.redirect(new URL("/org-dashboard", req.url))
      if (isUser) return NextResponse.redirect(new URL("/user-dashboard", req.url))
    }
    return res
  }

  // ── Wrong dashboard access ────────────────────────────────────────────────
  if (pathname.startsWith("/user-dashboard") && !isUser) {
    return NextResponse.redirect(new URL(isOrg ? "/org-dashboard" : "/", req.url))
  }

  if (pathname.startsWith("/org-dashboard") && !isOrg) {
    return NextResponse.redirect(new URL(isUser ? "/user-dashboard" : "/", req.url))
  }

  if (pathname.startsWith("/super-admin-dashboard")) {
    return NextResponse.redirect(new URL(isOrg ? "/org-dashboard" : "/user-dashboard", req.url))
  }

  return res
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