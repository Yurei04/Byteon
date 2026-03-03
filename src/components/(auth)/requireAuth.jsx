"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import SignLogInDialog from "@/app/(auth)/loginSigninDialog"

export default function RequireAuth({ children }) {
  const [session, setSession] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    let resolved = false

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
      if (!resolved) {
        resolved = true
        setLoading(false)
      }
    })

    supabase.auth.getSession().then(({ data }) => {
      if (!resolved) {
        resolved = true
        setSession(data.session)
        setLoading(false)
      }
    })

    return () => subscription.unsubscribe()
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