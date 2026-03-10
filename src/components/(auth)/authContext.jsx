// context/AuthContext.jsx
"use client"

import { createContext, useContext, useState, useEffect, useRef, useCallback } from "react"
import { supabase } from "@/lib/supabase"

const AuthContext = createContext(null)
const SESSION_KEY = "auth_role_cache"

export function AuthProvider({ children }) {
  const [session, setSession]   = useState(null)
  const [role, setRole]         = useState(null)
  const [profile, setProfile]   = useState(null)   // any extra user data you need globally
  const [loading, setLoading]   = useState(true)
  const currentUserIdRef        = useRef(null)

  // ─── Fetch role + profile from DB, or use sessionStorage cache ───────────
  const hydrateUser = useCallback(async (supabaseSession) => {
    if (!supabaseSession?.user) {
      setRole(null)
      setProfile(null)
      setLoading(false)
      return
    }

    const userId = supabaseSession.user.id

    // ✅ Check tab-specific cache first — no DB call on tab switch
    const cached = sessionStorage.getItem(SESSION_KEY)
    if (cached) {
      const parsed = JSON.parse(cached)
      if (parsed.id === userId) {
        setRole(parsed.role)
        setProfile(parsed.profile)
        setSession(supabaseSession)
        currentUserIdRef.current = userId
        setLoading(false)
        return
      }
    }

    // ── Not cached → fetch from DB ──────────────────────────────────────────
    const { data, error } = await supabase
      .from("profiles")
      .select("role, full_name, avatar_url, organization_id") // add whatever columns you need
      .eq("id", userId)
      .single()

    if (!error && data) {
      const cachePayload = { id: userId, role: data.role, profile: data }
      sessionStorage.setItem(SESSION_KEY, JSON.stringify(cachePayload))
      setRole(data.role)
      setProfile(data)
    }

    setSession(supabaseSession)
    currentUserIdRef.current = userId
    setLoading(false)
  }, [])

  // ─── Clear everything on logout ──────────────────────────────────────────
  const clearAuth = useCallback(() => {
    sessionStorage.removeItem(SESSION_KEY)
    currentUserIdRef.current = null
    setSession(null)
    setRole(null)
    setProfile(null)
    setLoading(false)
  }, [])

  // ─── Force refresh cache (call this after profile updates) ───────────────
  const refreshProfile = useCallback(async () => {
    sessionStorage.removeItem(SESSION_KEY)
    const { data: { session: s } } = await supabase.auth.getSession()
    await hydrateUser(s)
  }, [hydrateUser])

  useEffect(() => {
    // Initial session load
    supabase.auth.getSession().then(({ data }) => {
      hydrateUser(data.session)
    })

    // Auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === "SIGNED_IN") {
        const newId = newSession?.user?.id ?? null
        if (newId !== currentUserIdRef.current) {
          hydrateUser(newSession)
        }
      }
      if (event === "SIGNED_OUT")    clearAuth()
      if (event === "TOKEN_REFRESHED") setSession(newSession)   // keep token fresh, no re-fetch
    })

    // Re-check session when tab becomes visible
    const handleVisibility = () => {
      if (document.visibilityState === "visible") {
        supabase.auth.getSession().then(({ data }) => {
          const newId = data.session?.user?.id ?? null
          if (newId !== currentUserIdRef.current) {
            hydrateUser(data.session)
          } else if (data.session?.access_token !== session?.access_token) {
            setSession(data.session)  // just update the token, no profile re-fetch
          }
        })
      }
    }

    document.addEventListener("visibilitychange", handleVisibility)
    return () => {
      subscription.unsubscribe()
      document.removeEventListener("visibilitychange", handleVisibility)
    }
  }, [hydrateUser, clearAuth])

  return ( 
    <AuthContext.Provider value={{ session, role, profile, loading, refreshProfile, clearAuth }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error("useAuth must be used inside <AuthProvider>")
  return ctx
}