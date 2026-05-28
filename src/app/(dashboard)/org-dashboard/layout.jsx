// app/org-dashboard/layout.jsx

"use client"

import ProtectedRoute from "@/app/protected/protectedRoute"

export default function OrgDashboardLayout({ children }) {
  return (
    <ProtectedRoute allowOrg>
      {children}
    </ProtectedRoute>
  )
}