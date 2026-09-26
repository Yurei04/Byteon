// app/super-admin-dashboard/layout.jsx

"use client"

import ProtectedRoute from "@/app/protected/protectedRoute"

export default function SuperAdminLayout({ children }) {
  return (
    <ProtectedRoute allowSuperAdmin>
      {children}
    </ProtectedRoute>
  )
}