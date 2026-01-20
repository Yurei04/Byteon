"use client"

import { useState, useEffect, Children } from "react"
import { supabase } from "@/lib/supabase"
import SignLogInDialog from "@/app/(auth)/loginSigninDialog"

export default function RequireAuth (
    
) {
    const [session, setSession] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        supabase.auth.getSession()
        .then(({data}) => {
            setSession(data.session)
            setLoading(false)
        })

        const {
            data: {subscription},
        } = supabase.auth.onAuthStateChange((_event, session) => {
            setSession(session)
        })

        return () => subscription.unsubscribe()
    }, [])

    if (loading) return null

    if (!session) {
        return <SignLogInDialog/>
    }

    return children
}