// components/(auth)/authContext.jsx
"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"

const AuthContext = createContext(null)
const CACHE_KEY = "auth_cache"

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null)
  const [profile, setProfile]   = useState(null)
  const [role, setRole]         = useState(null)      // "user" | "org_admin"
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

    // ── Cache miss → check organizations table first ───────────────────────
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
      .single()

    if (!orgError && orgData) {
      // ── Found in organizations → org_admin ────────────────────────────────
      const resolvedProfile = { ...orgData, role: "org_admin", table: "organizations" }

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          id:      userId,
          role:    "org_admin",
          profile: resolvedProfile
        }))
      } catch {}

      setProfile(resolvedProfile)
      setRole("org_admin")
      setSession(supabaseSession)
      currentUserIdRef.current = userId
      setLoading(false)
      return
    }

    // ── Not in organizations → check users table ───────────────────────────
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
      .single()

    if (!userError && userData) {
      // ── Found in users → user ──────────────────────────────────────────────
      const resolvedProfile = { ...userData, role: "user", table: "users" }

      try {
        sessionStorage.setItem(CACHE_KEY, JSON.stringify({
          id:      userId,
          role:    "user",
          profile: resolvedProfile
        }))
      } catch {}

      setProfile(resolvedProfile)
      setRole("user")
    } else {
      // ── Not found in either table — new user, no profile yet ──────────────
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
    await supabase.auth.signOut()
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
      isLoggedIn:  !!session,
      isUser:      role === "user",
      isOrgAdmin:  role === "org_admin",
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
