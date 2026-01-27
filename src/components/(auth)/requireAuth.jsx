"use client"

import { useState, useEffect } from "react"
import { supabase } from "@/lib/supabase"
import SignLogInDialog from "@/app/(auth)/loginSigninDialog"

export default function RequireAuth({ 
    children 
}) {  
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

    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen w-full">
                <div className="text-lg">Loading...</div>
            </div>
        )
    }

    if (!session) {
        return <SignLogInDialog/>
    }

    return <>{children}</>
}