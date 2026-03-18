// components/(auth)/authContext.jsx
"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"
import { updateAccountTokens, getActiveAccountId } from "@/lib/accountManager" 

const AuthContext = createContext(null)
const CACHE_KEY = "auth_cache"

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null)
  const [profile, setProfile]   = useState(null)
  const [role, setRole]         = useState(null)      // "user" | "org_admin" | "super_admin"
  const [loading, setLoading]   = useState(true)
  const currentUserIdRef        = useRef(null)

  const hydrateUser = useCallback(async (supabaseSession) => {
    if (!supabaseSession?.user) {
      setSession(null)
      setProfile(null)
      setRole(null)
      setLoading(false)
      return
    }

    const userId = supabaseSession.user.id

    // ✅ Tab-specific cache — instant on tab switch, no DB call
    try {
      const cached = sessionStorage.getItem(CACHE_KEY)
      if (cached) {
        const parsed = JSON.parse(cached)
        if (parsed.id === userId) {
          setSession(supabaseSession)
          setProfile(parsed.profile)
          setRole(parsed.role)
          currentUserIdRef.current = userId
          setLoading(false)
          return
        }
      }
    } catch {}

    // ── 1. Check super_admins FIRST ────────────────────────────────────────
    const { data: superData, error: superError } = await supabase
      .from("super_admins")
      .select("id, user_id, name, organization_id, created_at")
      .eq("user_id", userId)
      .maybeSingle()

    if (!superError && superData) {
      // Fetch linked platform org so Create tab works
      let linkedOrg = null
      if (superData.organization_id) {
        const { data: orgData } = await supabase
          .from("organizations")
          .select(`
            id, user_id, name, author_name, description,
            profile_photo_url, color_scheme, primary_color, secondary_color,
            active, total_announcements, total_blogs, total_resources,
            profile_completed, created_at, updated_at
          `)
          .eq("id", superData.organization_id)
          .maybeSingle()
        linkedOrg = orgData || null
      }

      const resolvedProfile = {
        ...superData,
        role: "super_admin",
        table: "super_admins",
        linkedOrg,
      }

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          id:      userId,
          role:    "super_admin",
          profile: resolvedProfile,
        }))
      } catch {}

      setProfile(resolvedProfile)
      setRole("super_admin")
      setSession(supabaseSession)
      currentUserIdRef.current = userId
      setLoading(false)
      return
    }

    // ── 2. Check organizations ─────────────────────────────────────────────
    const { data: orgData, error: orgError } = await supabase
      .from("organizations")
      .select(`
        id,
        user_id,
        name,
        author_name,
        description,
        profile_photo_url,
        color_scheme,
        primary_color,
        secondary_color,
        active,
        total_announcements,
        total_blogs,
        total_resources,
        profile_completed,
        created_at,
        updated_at
      `)
      .eq("user_id", userId)
      .maybeSingle()

    if (!orgError && orgData) {
      const resolvedProfile = { ...orgData, role: "org_admin", table: "organizations" }

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          id:      userId,
          role:    "org_admin",
          profile: resolvedProfile,
        }))
      } catch {}

      setProfile(resolvedProfile)
      setRole("org_admin")
      setSession(supabaseSession)
      currentUserIdRef.current = userId
      setLoading(false)
      return
    }

    // ── 3. Check users ─────────────────────────────────────────────────────
    const { data: userData, error: userError } = await supabase
      .from("users")
      .select(`
        id,
        user_id,
        name,
        age,
        affiliation,
        country,
        profile_photo_url,
        achievements,
        achievements_metadata,
        total_projects,
        total_hackathons_joined,
        total_blogs_read,
        chapters_completed,
        chapters_unlocked,
        profile_completed,
        created_at,
        updated_at
      `)
      .eq("user_id", userId)
      .maybeSingle()

    if (!userError && userData) {
      const resolvedProfile = { ...userData, role: "user", table: "users" }

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          id:      userId,
          role:    "user",
          profile: resolvedProfile,
        }))
      } catch {}

      setProfile(resolvedProfile)
      setRole("user")
    } else {
      setProfile(null)
      setRole(null)
    }

    setSession(supabaseSession)
    currentUserIdRef.current = userId
    setLoading(false)
  }, [])

  const clearAuth = useCallback(() => {
    try { sessionStorage.removeItem(CACHE_KEY) } catch {}
    currentUserIdRef.current = null
    setSession(null)
    setProfile(null)
    setRole(null)
    setLoading(false)
  }, [])

  const refreshProfile = useCallback(async () => {
    try { sessionStorage.removeItem(CACHE_KEY) } catch {}
    const { data: { session: s } } = await supabase.auth.getSession()
    await hydrateUser(s)
  }, [hydrateUser])

  const logout = useCallback(async () => {
    try {
      const lsKeys = Object.keys(localStorage).filter(k => k.startsWith("sb-"))
      lsKeys.forEach(k => localStorage.removeItem(k))
    } catch {}
    try {
      // ✅ Remove scope:"local" — we need the cookie cleared too.
      // scope:"local" only wipes localStorage, the auth cookie stays alive.
      // Middleware reads cookies, so the old code sent users back to dashboard.
      await supabase.auth.signOut()
    } catch {}
    clearAuth()
  }, [clearAuth])

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => hydrateUser(data.session))

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "SIGNED_IN") {
        if (newSession?.user?.id !== currentUserIdRef.current) {
          hydrateUser(newSession)
        }
      }
      if (event === "SIGNED_OUT")      clearAuth()
      if (event === "TOKEN_REFRESHED") setSession(newSession)
    })

    const handleVisibility = () => {
      if (document.visibilityState !== "visible") return
      supabase.auth.getSession().then(({ data }) => {
        const newId = data.session?.user?.id ?? null
        if (newId !== currentUserIdRef.current) {
          hydrateUser(data.session)
        } else if (data.session?.access_token !== session?.access_token) {
          setSession(data.session)
        }
      })
    }

    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      subscription.unsubscribe()
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [hydrateUser, clearAuth, session?.access_token])

  return (
    <AuthContext.Provider value={{
      session,
      profile,
      role,
      loading,
      logout,
      refreshProfile,
      isLoggedIn:   !!session,
      isUser:       role === "user",
      isOrgAdmin:   role === "org_admin",
      isSuperAdmin: role === "super_admin",
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}