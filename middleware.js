import { NextResponse } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(req) {
  const res = NextResponse.next()
  const pathname = req.nextUrl.pathname

  // Never intercept the suspended page itself — infinite redirect guard
  if (pathname.startsWith("/account-suspended")) return res

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        get: (name) => req.cookies.get(name)?.value,
        set: (name, value, options) => res.cookies.set({ name, value, ...options }),
        remove: (name, options) => res.cookies.set({ name, value: "", ...options }),
      },
    }
  )

  const { data: { session } } = await supabase.auth.getSession()

  // ── Not logged in ─────────────────────────────────────────────────────────
  if (!session) {
    if (
      pathname.startsWith("/user-dashboard") ||
      pathname.startsWith("/org-dashboard") ||
      pathname.startsWith("/super-admin-dashboard")
    ) {
      return NextResponse.redirect(new URL("/log-in", req.url))
    }
    return res
  }

  const userId = session.user.id

  // ── Fetch profiles (include active + suspension_reason) ──────────────────
  const [
    { data: userProfile },
    { data: orgProfile },
    { data: superProfile },
  ] = await Promise.all([
    supabase.from("users").select("id, active").eq("user_id", userId).maybeSingle(),
    supabase.from("organizations").select("id, active").eq("user_id", userId).maybeSingle(),
    supabase.from("super_admins").select("id").eq("user_id", userId).maybeSingle(),
  ])

  // ✅ Fetch suspension_reason separately — if column doesn't exist, this just returns null gracefully
  let suspensionReason = null
  if ((userProfile?.active === false) || (orgProfile?.active === false)) {
    const activeProfile = userProfile ?? orgProfile
    const table = userProfile ? "users" : "organizations"
    const { data: reasonData } = await supabase
      .from(table)
      .select("suspension_reason")
      .eq("id", activeProfile.id)
      .maybeSingle()
    suspensionReason = reasonData?.suspension_reason ?? null
  }

  const isUser       = !!userProfile
  const isOrg        = !!orgProfile
  const isSuperAdmin = !!superProfile

  // ── Bug 5a: Account DELETED — session exists but no profile row ───────────
  // (super admins are never deleted this way, skip check for them)
  if (!isUser && !isOrg && !isSuperAdmin) {
    // Clear the dangling Supabase session
    const suspendedUrl = new URL("/account-suspended", req.url)
    suspendedUrl.searchParams.set("reason", "deleted")
    return NextResponse.redirect(suspendedUrl)
  }

  // ✅ Replace both suspension redirect blocks
  if (userProfile && userProfile.active === false) {
    const suspendedUrl = new URL("/account-suspended", req.url)
    suspendedUrl.searchParams.set("reason", "suspended")
    if (suspensionReason) suspendedUrl.searchParams.set("detail", suspensionReason)
    return NextResponse.redirect(suspendedUrl)
  }

  if (orgProfile && orgProfile.active === false) {
    const suspendedUrl = new URL("/account-suspended", req.url)
    suspendedUrl.searchParams.set("reason", "suspended")
    if (suspensionReason) suspendedUrl.searchParams.set("detail", suspensionReason)
    return NextResponse.redirect(suspendedUrl)
}

  // ── Prevent logged-in users from hitting login/signup ─────────────────────
  if (pathname === "/log-in" || pathname === "/sign-up") {
    if (isSuperAdmin) return NextResponse.redirect(new URL("/super-admin-dashboard", req.url))
    if (isOrg)        return NextResponse.redirect(new URL("/org-dashboard", req.url))
    if (isUser)       return NextResponse.redirect(new URL("/user-dashboard", req.url))
  }

  // ── Wrong dashboard access ────────────────────────────────────────────────
  if (pathname.startsWith("/user-dashboard") && !isUser) {
    if (isOrg)        return NextResponse.redirect(new URL("/org-dashboard", req.url))
    if (isSuperAdmin) return NextResponse.redirect(new URL("/super-admin-dashboard", req.url))
  }

  if (pathname.startsWith("/org-dashboard") && !isOrg) {
    if (isUser)       return NextResponse.redirect(new URL("/user-dashboard", req.url))
    if (isSuperAdmin) return NextResponse.redirect(new URL("/super-admin-dashboard", req.url))
  }

  if (pathname.startsWith("/super-admin-dashboard") && !isSuperAdmin) {
    if (isOrg)  return NextResponse.redirect(new URL("/org-dashboard", req.url))
    if (isUser) return NextResponse.redirect(new URL("/user-dashboard", req.url))
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