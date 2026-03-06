"use client"

import { useState, useEffect, useRef } from "react"
import { supabase } from "@/lib/supabase"
import SignLogInDialog from "@/app/(auth)/loginSigninDialog"

export default function RequireAuth({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)
  const currentUserIdRef = useRef(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      currentUserIdRef.current = data.session?.user?.id ?? null
      setSession(data.session)
      setLoading(false)
    })

    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, newSession) => {
      if (event === 'SIGNED_IN' || event === 'SIGNED_OUT') {
        const newUserId = newSession?.user?.id ?? null
        if (newUserId !== currentUserIdRef.current) {
          currentUserIdRef.current = newUserId
          setSession(newSession)
        }
      }

      // ✅ Keep session fresh after tab switch — Supabase fires this when it
      // auto-refreshes the access token. Without this, the session in state is
      // stale and DB calls made after returning to the tab use an expired token.
      if (event === 'TOKEN_REFRESHED') {
        setSession(newSession)
      }
    })

    // ✅ When tab becomes visible again, proactively re-fetch the session.
    // This covers the gap between when the token expired and TOKEN_REFRESHED fires.
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        supabase.auth.getSession().then(({ data }) => {
          const newUserId = data.session?.user?.id ?? null
          // Only update session if the user changed or if there's a fresher token
          if (newUserId !== currentUserIdRef.current || data.session?.access_token !== session?.access_token) {
            currentUserIdRef.current = newUserId
            setSession(data.session)
          }
        })
      }
    }

    document.addEventListener('visibilitychange', handleVisibilityChange)
    return () => {
      subscription.unsubscribe()
      document.removeEventListener('visibilitychange', handleVisibilityChange)
    }
  }, [])

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen w-full">
        <style>{`
          @keyframes spin { to { transform: rotate(360deg); } }
          .spinner {
            width: 28px; height: 28px;
            border: 2px solid #e5e7eb;
            border-top-color: #6b7280;
            border-radius: 50%;
            animation: spin 0.7s linear infinite;
          }
        `}</style>
        <div className="spinner" />
      </div>
    )
  }

  if (!session) return <SignLogInDialog />
  return <>{children}</>
}