"use client"

import { AuthProvider } from "@/components/(auth)/authContext"
import { DatabaseErrorBlocker } from "@/components/errorHandling/database-error-blocker"
import { MaintenanceBlocker } from "@/components/errorHandling/maintenance-blocker"
import { OfflineBlocker } from "@/components/errorHandling/offline-blocker"
import { ServerErrorBlocker } from "@/components/errorHandling/server-error-blocker"
import { DbErrorBoundary } from "@/components/errorHandling/error-boundary-db-blocker"
import { ThemeProvider } from "@/components/theme-provider"
import ChatWidget from "@/components/chatbot/chat-widget"
import { supabase } from "@/lib/supabase"
import { useState, useEffect, useRef, useCallback } from "react"

export default function ClientLayout({ children }) {
  const [dbError, setDbError] = useState(false)
  const hasChecked = useRef(false)

  const checkDbConnection = useCallback(async () => {
    if (!supabase) { setDbError(true); return }
    try {
      const { error } = await supabase.from("organizations").select("count").limit(1)
      setDbError(!!error)
    } catch { setDbError(true) }
  }, [])

  useEffect(() => {
    if (hasChecked.current) return
    hasChecked.current = true
    checkDbConnection()
  }, [checkDbConnection])

  useEffect(() => {
    const handle = () => { if (document.visibilityState === "visible") checkDbConnection() }
    document.addEventListener("visibilitychange", handle)
    return () => document.removeEventListener("visibilitychange", handle)
  }, [checkDbConnection])

  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem disableTransitionOnChange>
      <AuthProvider>
        <DbErrorBoundary>
          {children}
        </DbErrorBoundary>
      </AuthProvider>
      <OfflineBlocker />
      <DatabaseErrorBlocker isError={dbError} onRetry={checkDbConnection} />
      <ServerErrorBlocker isError={false} />
      <MaintenanceBlocker isActive={false} />

      <ChatWidget />  
    </ThemeProvider>
  )
}