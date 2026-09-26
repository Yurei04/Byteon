"use client"
import { useAuth } from "@/components/(auth)/authContext"
import ProtectedRoute from "@/app/protected/protectedRoute"

export default function UserDashboardLayout({ children }) {
  const { loading, isLoggedIn, isUser, role, session } = useAuth()
  
  console.log("🔐 AUTH STATE:", {
    loading,
    isLoggedIn,
    isUser,
    role,
    userId: session?.user?.id,
  })

  return (
    <ProtectedRoute allowUser>
      {children}
    </ProtectedRoute>
  )
}