// components/(auth)/requireAuth.jsx
"use client"

import { useAuth } from "./authContext" 
import SignLogInDialog from "@/app/(auth)/loginSigninDialog"

export default function RequireAuth({ children }) {
  const { isLoggedIn, loading } = useAuth()

  if (loading)     return <AuthSpinner />
  if (!isLoggedIn) return <SignLogInDialog />

  return <>{children}</>
}

function AuthSpinner() {
  return (
    <div className="flex items-center justify-center min-h-screen w-full">
      <div className="w-7 h-7 rounded-full border-2 border-gray-200 border-t-gray-500 animate-spin" />
    </div>
  )
}