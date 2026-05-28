// app/user-dashboard/layout.jsx

"use client"

import ProtectedRoute from "@/app/protected/protectedRoute"

export default function UserDashboardLayout({ children }) {
  return (
    <ProtectedRoute allowUser>
      {children}
    </ProtectedRoute>
  )
}